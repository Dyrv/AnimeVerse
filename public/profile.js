const supabase = require('./src/config/client');
const login = require("./forms");


let { data: profile, error } = await supabase
  .from('profile')
  .select('email')


  console.log(profile);