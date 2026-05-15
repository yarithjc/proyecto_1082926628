'use client';

import { useState } from 'react';

interface TableInfo {
  name: string;
  rowCount: number;
}

interface ConnectionResult {
  connected: boolean;
  error?: string;
  tables?: Record<string, number>;
}

interface CreateResult {
  status: 'success' | 'error';
  message: string;
  table?: string;
  details?: string;
}

export default function SetupDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);
  const [createResults, setCreateResults] = useState<CreateResult[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);

  const handleTestConnection = async () => {
    setLoading(true);
    setConnectionResult(null);
    setTables([]);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'GET',
      });

      const data: ConnectionResult = await response.json();
      setConnectionResult(data);

      if (data.connected && data.tables) {
        const tableList = Object.entries(data.tables).map(([name, count]) => ({
          name,
          rowCount: count,
        }));
        setTables(tableList);
      }
    } catch (error) {
      setConnectionResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTables = async () => {
    setLoading(true);
    setCreateResults([]);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-all' }),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setCreateResults(data);
      } else {
        setCreateResults([
          {
            status: 'error',
            message: 'Respuesta inválida del servidor',
            details: JSON.stringify(data),
          },
        ]);
      }

      // Re-test connection after creation
      setTimeout(() => {
        handleTestConnection();
      }, 1000);
    } catch (error) {
      setCreateResults([
        {
          status: 'error',
          message: 'Error al crear tablas',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Setup Supabase</h1>
          <p className="text-slate-300">
            Configura la conexión a PostgreSQL y crea las tablas necesarias
          </p>
        </div>

        {/* Section 1: Test Connection */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">1. Probar Conexión</h2>

          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition mb-6"
          >
            {loading ? '⏳ Probando...' : '🔌 Probar Conexión'}
          </button>

          {/* Connection Result */}
          {connectionResult && (
            <div className={`p-4 rounded-lg border-2 ${
              connectionResult.connected
                ? 'bg-green-900 border-green-600'
                : 'bg-red-900 border-red-600'
            }`}>
              <p className={`font-bold ${
                connectionResult.connected
                  ? 'text-green-200'
                  : 'text-red-200'
              }`}>
                {connectionResult.connected ? '✅ Conectado' : '❌ No conectado'}
              </p>
              {connectionResult.error && (
                <p className="text-red-100 mt-2 text-sm">{connectionResult.error}</p>
              )}
            </div>
          )}

          {/* Tables List */}
          {tables.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tablas existentes:</h3>
              <div className="grid gap-3">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="bg-slate-700 p-4 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-white font-medium">{table.name}</span>
                    <span className="text-slate-300 text-sm">
                      {table.rowCount} fila{table.rowCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Create Tables */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">2. Crear Tablas</h2>

          <button
            onClick={handleCreateTables}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition mb-6"
          >
            {loading ? '⏳ Creando...' : '✨ Crear Todas las Tablas'}
          </button>

          {/* Create Results */}
          {createResults.length > 0 && (
            <div className="grid gap-3">
              {createResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === 'success'
                      ? 'bg-green-900 border-green-600'
                      : 'bg-red-900 border-red-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">
                      {result.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      {result.table && (
                        <p className={`font-bold ${
                          result.status === 'success'
                            ? 'text-green-200'
                            : 'text-red-200'
                        }`}>
                          {result.table}
                        </p>
                      )}
                      <p className={`text-sm ${
                        result.status === 'success'
                          ? 'text-green-100'
                          : 'text-red-100'
                      }`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-slate-300 mt-2 font-mono bg-slate-900 p-2 rounded overflow-auto">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mt-8 p-4 bg-yellow-900 border-2 border-yellow-600 rounded-lg">
          <p className="text-yellow-200 text-sm">
            ⚠️ Esta página es temporal para setup. Se debe eliminar después de configurar las tablas.
          </p>
        </div>
      </div>
    </div>
  );
}
