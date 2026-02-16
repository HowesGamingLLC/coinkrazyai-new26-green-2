import { query } from './connection';
import { GameProvider, ProviderCreateRequest, ProviderUpdateRequest, GameImportHistory } from '@shared/api';

/**
 * Get all game providers
 */
export async function getProviders() {
  const result = await query('SELECT * FROM game_providers ORDER BY name ASC');
  return result.rows;
}

/**
 * Get a specific provider by ID
 */
export async function getProvider(providerId: number) {
  const result = await query('SELECT * FROM game_providers WHERE id = $1', [providerId]);
  return result.rows[0];
}

/**
 * Get provider by slug
 */
export async function getProviderBySlug(slug: string) {
  const result = await query('SELECT * FROM game_providers WHERE slug = $1', [slug]);
  return result.rows[0];
}

/**
 * Create a new provider
 */
export async function createProvider(data: ProviderCreateRequest, createdByAdminId: number) {
  const result = await query(
    `INSERT INTO game_providers (
      name, slug, type, description, logo_url, website_url, 
      api_endpoint, api_key, api_secret, authentication_type,
      sync_interval_minutes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      data.name,
      data.slug,
      data.type,
      data.description,
      data.logo_url,
      data.website_url,
      data.api_endpoint,
      data.api_key,
      data.api_secret,
      data.authentication_type || 'api_key',
      data.sync_interval_minutes || 1440,
      createdByAdminId
    ]
  );
  return result.rows[0];
}

/**
 * Update a provider
 */
export async function updateProvider(providerId: number, data: ProviderUpdateRequest) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.is_enabled !== undefined) {
    fields.push(`is_enabled = $${paramCount++}`);
    values.push(data.is_enabled);
  }
  if (data.api_endpoint !== undefined) {
    fields.push(`api_endpoint = $${paramCount++}`);
    values.push(data.api_endpoint);
  }
  if (data.api_key !== undefined) {
    fields.push(`api_key = $${paramCount++}`);
    values.push(data.api_key);
  }
  if (data.api_secret !== undefined) {
    fields.push(`api_secret = $${paramCount++}`);
    values.push(data.api_secret);
  }
  if (data.sync_interval_minutes !== undefined) {
    fields.push(`sync_interval_minutes = $${paramCount++}`);
    values.push(data.sync_interval_minutes);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(providerId);

  const sql = `UPDATE game_providers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  const result = await query(sql, values);
  return result.rows[0];
}

/**
 * Delete a provider
 */
export async function deleteProvider(providerId: number) {
  const result = await query('DELETE FROM game_providers WHERE id = $1 RETURNING *', [providerId]);
  return result.rows[0];
}

/**
 * Update provider status
 */
export async function updateProviderStatus(providerId: number, status: string, errorMessage?: string) {
  const timestamp = status === 'error' ? 'CURRENT_TIMESTAMP' : 'NULL';
  const result = await query(
    `UPDATE game_providers 
     SET status = $1, 
         error_log = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE error_log END,
         last_error = CASE WHEN $2::text IS NOT NULL THEN CURRENT_TIMESTAMP ELSE last_error END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [status, errorMessage || null, providerId]
  );
  return result.rows[0];
}

/**
 * Update provider last sync time
 */
export async function updateProviderLastSync(providerId: number, totalGames: number) {
  const result = await query(
    `UPDATE game_providers 
     SET last_sync_at = CURRENT_TIMESTAMP, 
         total_games = $1,
         status = 'connected',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [totalGames, providerId]
  );
  return result.rows[0];
}

/**
 * Get provider games
 */
export async function getProviderGames(providerId: number) {
  const result = await query(
    `SELECT pg.*, g.* FROM provider_games pg
     JOIN games g ON pg.game_id = g.id
     WHERE pg.provider_id = $1`,
    [providerId]
  );
  return result.rows;
}

/**
 * Create or update a provider game mapping
 */
export async function upsertProviderGame(
  providerId: number,
  gameId: number,
  providerGameId: string,
  providerGameName?: string,
  externalMetadata?: any
) {
  const result = await query(
    `INSERT INTO provider_games (provider_id, game_id, provider_game_id, provider_game_name, external_metadata)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (provider_id, provider_game_id) 
     DO UPDATE SET 
       game_id = $2,
       provider_game_name = $4,
       external_metadata = $5,
       last_synced_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [providerId, gameId, providerGameId, providerGameName, JSON.stringify(externalMetadata)]
  );
  return result.rows[0];
}

/**
 * Create import history record
 */
export async function createImportHistory(
  providerId: number,
  importType: string,
  adminId: number,
  totalAttempted: number = 0
) {
  const result = await query(
    `INSERT INTO game_import_history (provider_id, import_type, total_games_attempted, imported_by, status)
     VALUES ($1, $2, $3, $4, 'in_progress')
     RETURNING *`,
    [providerId, importType, totalAttempted, adminId]
  );
  return result.rows[0];
}

/**
 * Update import history with results
 */
export async function updateImportHistory(
  importHistoryId: number,
  imported: number,
  updated: number,
  skipped: number,
  status: string,
  errorMessage?: string
) {
  const startTime = await query(
    'SELECT started_at FROM game_import_history WHERE id = $1',
    [importHistoryId]
  );

  const startedAt = new Date(startTime.rows[0].started_at).getTime();
  const duration = Math.floor((Date.now() - startedAt) / 1000);

  const result = await query(
    `UPDATE game_import_history 
     SET total_games_imported = $1,
         total_games_updated = $2,
         total_games_skipped = $3,
         status = $4,
         error_message = $5,
         import_duration_seconds = $6,
         completed_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING *`,
    [imported, updated, skipped, status, errorMessage || null, duration, importHistoryId]
  );
  return result.rows[0];
}

/**
 * Get import history for provider
 */
export async function getImportHistory(providerId: number, limit: number = 20) {
  const result = await query(
    `SELECT * FROM game_import_history 
     WHERE provider_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [providerId, limit]
  );
  return result.rows;
}

/**
 * Log provider API call
 */
export async function logProviderApiCall(
  providerId: number,
  endpoint: string,
  method: string,
  requestBody: any,
  responseCode: number,
  responseBody: any,
  errorMessage?: string,
  durationMs?: number
) {
  await query(
    `INSERT INTO provider_api_logs (
      provider_id, endpoint, method, request_body, response_code, response_body, error_message, duration_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      providerId,
      endpoint,
      method,
      JSON.stringify(requestBody),
      responseCode,
      JSON.stringify(responseBody),
      errorMessage,
      durationMs
    ]
  );
}

/**
 * Get API logs for provider
 */
export async function getProviderApiLogs(providerId: number, limit: number = 50) {
  const result = await query(
    `SELECT * FROM provider_api_logs 
     WHERE provider_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [providerId, limit]
  );
  return result.rows;
}

/**
 * Get provider statistics
 */
export async function getProviderStats(providerId: number) {
  const result = await query(
    `SELECT 
       gp.id,
       gp.name,
       gp.total_games,
       (SELECT COUNT(*) FROM provider_games WHERE provider_id = $1) as mapped_games,
       (SELECT COUNT(*) FROM game_import_history WHERE provider_id = $1) as import_count,
       (SELECT SUM(total_games_imported) FROM game_import_history WHERE provider_id = $1) as total_imported,
       gp.last_sync_at,
       gp.status
     FROM game_providers gp
     WHERE gp.id = $1`,
    [providerId]
  );
  return result.rows[0];
}
