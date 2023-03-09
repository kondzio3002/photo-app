const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const authorPattern = new RegExp(
        /(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/,
        "g"
      );
      const authorMatched = author.match(authorPattern).join('');
      if(authorMatched.length < author.length) {
        res.status(500).json({ message: 'Invalid characters...' });
        throw new Error('Invalid characters')
      };

      const emailPattern = new RegExp(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "g"
      );
      const emailMatched = email.match(emailPattern).join('');
      if(emailMatched.length < email.length) {
        res.status(500).json({ message: 'Invalid characters...' });
        throw new Error('Invalid characters')
      };

      const titlePattern = new RegExp(
        /(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/,
        "g"
      );
      const titleMatched = title.match(titlePattern).join('');
      if(titleMatched.length < title.length) {
        res.status(500).json({ message: 'Invalid characters...' });
        throw new Error('Invalid characters...')
      };

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      if((fileExt[1] === '.gif' || '.jpg' || '.png') && (title.length <= 25) && (author.length <= 50)) {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        res.status(500).json({ message: 'Wrong input!' });
        throw new Error('Wrong input!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const userIP = requestIp.getClientIp(req);
    const findUser = await Voter.findOne({ user: userIP });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    if (findUser) {
      if (findUser.votes.includes(photoToUpdate._id)) {
        res.status(500).json(err);
      } else {
        photoToUpdate.votes++;
        await photoToUpdate.save();
        findUser.votes.push(photoToUpdate._id);
        await findUser.save();
        res.json(photoToUpdate);
      }
    } else {
      const newVoter = new Voter({ user: userIP, votes: [photoToUpdate._id] });
      await newVoter.save();
      photoToUpdate.votes ++;
      await photoToUpdate.save();
      res.json(photoToUpdate);
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
