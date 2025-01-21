// Importa a função createClient do módulo @supabase/supabase-js
const { createClient } = require('@supabase/supabase-js');

// URL do Supabase e chave de acesso
const supabaseUrl = 'Substitua pela seu link da supabase';
const supabaseKey = 'Substitua pela sua chave pública ou serviço';

// Cria uma instância do cliente Supabase
const supabase =  createClient(supabaseUrl,supabaseKey);

// Exporta a instância do cliente Supabase para uso em outros módulos
module.exports = supabase;
