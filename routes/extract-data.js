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
      case 'application/x-zip-compressed':
        const files = await decompress(file.buffer)
        // let JSONfiles = files.filter(file => file.path.endsWith('.json'));

        let JSONfiles = files.filter(
          file => file.path.endsWith('actor.json') ||
                  file.path.endsWith('outbox.json') ||
                  file.path.includes('avatar'));
    
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

          if (file.originalname.endsWith('outbox.json')){
            data.format = 'pixelfed';
          } else {
            data.format = 'firefish';
          }
        }
        break;
      case 'application/octet-stream':
        if (file.originalname.endsWith('.backup')){
          let userData = req.file.buffer.toString().split('\n').filter(d => d.trim().length > 0);
          userData = userData.map(data => JSON.parse(data));
          const username = userData[0].user.nickname;

          data.actor = {
            name: userData[0].user.username,
            summary: userData[0].contact[0].about,
            published: userData[0].user.register_date
          };

          data.avatar_url = userData[0].contact[0].avatar;
          data.outbox = userData[1].item.filter(data => data['author-link'].endsWith(`profile/${username}`));
          data.format = 'friendica';
        }
        break;
      default:
        break;
    }

    // console.log({data});
    res.json({data});
  } else {
    res.json({error: 'no_data'});
  }
});

export default router;
