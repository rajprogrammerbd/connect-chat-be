// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
console.clear();

import Data from "../src/Data/Events";

const d = new Data();
d.addUser('Dola1 Dutta','doladutta5r@gmail.com', false, 'def73dd596d9eda12645')
  .then(obj => console.log('result', obj))
  .catch(res => console.error(res))
