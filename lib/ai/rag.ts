import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

/**
 * Store document chunks with embeddings in Supabase
 */
export async function storeDocumentChunks(
  userId: string,
  documentId: string,
  chunks: string[]
): Promise<void> {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);
    
    const { error } = await supabase.from('document_embeddings').insert({
      user_id: userId,
      document_id: documentId,
      chunk_index: i,
      content: chunk,
      embedding: embedding,
    });
    
    if (error) {
      console.error(`Error storing chunk ${i}:`, error);
      throw error;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Find relevant chunks using vector similarity search
 */
export async function findRelevantChunks(
  userId: string,
  query: string,
  topK: number = 5
): Promise<Array<{ content: string; similarity: number }>> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Use Supabase function for similarity search
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7, // Only return chunks with >70% similarity
    match_count: topK,
    user_id: userId,
  });
  
  if (error) {
    console.error('Error finding relevant chunks:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Assemble context from relevant chunks
 */
export async function assembleContext(
  userId: string,
  query: string,
  maxChunks: number = 3
): Promise<string> {
  const relevantChunks = await findRelevantChunks(userId, query, maxChunks);
  
  if (relevantChunks.length === 0) {
    return '';
  }
  
  // Join chunks with separators
  return relevantChunks
    .map((chunk, index) => `[Source ${index + 1}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

/**
 * Delete all embeddings for a document
 */
export async function deleteDocumentEmbeddings(
  documentId: string
): Promise<void> {
  const { error } = await supabase
    .from('document_embeddings')
    .delete()
    .eq('document_id', documentId);
  
  if (error) {
    console.error('Error deleting embeddings:', error);
    throw error;
  }
}

/**
 * Get total number of chunks for a document
 */
export async function getDocumentChunkCount(
  documentId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('document_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('document_id', documentId);
  
  if (error) {
    console.error('Error counting chunks:', error);
    throw error;
  }
  
  return count || 0;
}
