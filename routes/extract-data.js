import express from "express";
import multer from "multer";
import debug from "../modules/debug.js";


import decompress from 'decompress';



const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('archive');


const router = express.Router();

router.post("/", upload, async (req, res) => {
  const {file} = req;
  console.log({file});
  let data = {};

  if (file) {
    switch (file.mimetype) {
      case 'application/x-gzip':
        const files = await decompress(file.buffer)
        // let JSONfiles = files.filter(file => file.path.endsWith('.json'));

        let JSONfiles = files.filter(
          file => file.path.endsWith('actor.json') ||
                  file.path.endsWith('outbox.json') ||
                  file.path.includes('avatar'));
    
        console.log(JSONfiles);

        JSONfiles.forEach(f => {
          if (f.path.endsWith('.json')){
            data[f.path.replace('.json', '').replace('.jpg', '')] = JSON.parse(f.data.toString('utf8'));
          } else{
            data['avatar'] = f.data.toString('base64');
          }
        });
   
        data.format = 'mastodon';
        break;
      case 'text/plain':
        if (file.originalname.endsWith('.json')){
          const jsonData = JSON.parse(req.file.buffer.toString());
          data.outbox = jsonData;
          data.format = 'firefish';

          console.log(jsonData);
        }
        break;
      default:
        break;
    }

    console.log({data});

    res.json({data});
  } else {
    res.json({error: 'no_data'});
  }
});

export default router;
