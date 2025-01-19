// Importa a função createClient do módulo @supabase/supabase-js
const { createClient } = require('@supabase/supabase-js');

// URL do Supabase e chave de acesso
const supabaseUrl = 'https://oaihncazmnywmuanzcxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haWhuY2F6bW55d211YW56Y3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNDMyNjgsImV4cCI6MjA0ODgxOTI2OH0.XHMYbLmu8QxHLrIla-Ydi2b0O-sTUYR5GJDAwtfEhFI'; // Substitua pela sua chave pública ou serviço

// Cria uma instância do cliente Supabase
const supabase =  createClient(supabaseUrl,supabaseKey);

// Exporta a instância do cliente Supabase para uso em outros módulos
module.exports = supabase;