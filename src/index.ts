// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
console.clear();

import Data from "../src/Data/Events";

const d = new Data();
d.addUser('raj dutta','rd2249619s@gmail.com', true)
  .then(obj => console.log('result', obj))
  .catch(res => console.error(res))

