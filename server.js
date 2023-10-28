import express from 'express'
import filemodal from './modals/filemodal.js'
import multer from 'multer'
import sharp from 'sharp'
import crypto from 'crypto'


import { getObjectSignedUrl, uploadFile } from './s3.js'
import connectDB from './database/config.js'

const app = express()
const bucketName = process.env.AWS_BUCKET_NAME
connectDB()



const  upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: function (req, file, done) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      done(null, true);
    } else {
      //prevent the upload
      var newError = new Error("File type is incorrect");
      newError.name = "MulterError";
      done(newError, false);
    }
  },
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

app.get("/", (req, res) => {
 
  res.send({message:'kkkkkkkkkkkkk'})

})


app.post('/api/files', upload.single('image'), async (req, res) => {
  const file = req.file
  const imageName = generateFileName()
  const fileBuffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer()

  await uploadFile(fileBuffer, imageName, file.mimetype)

  const newImage = new filemodal({
    imageName,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageName}`,
    // Add other fields as needed
  });
 await newImage.save()
  
  res.status(201).send("yessssssssssss")
})
app.post('/api/multiple-files', upload.array('images',3), async (req, res) => {
 const files = req.files
  if (files && files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      
    
  const imageName = generateFileName()
  const fileBuffer = await sharp(files[i].buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer()
    
  await uploadFile(fileBuffer, imageName, files[i].mimetype)
  const newImage = new filemodal({
    imageName,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageName}`,
    // Add other fields as needed
  });
 await newImage.save()

    }}

  
  res.status(201).send("yessssssssssss")
})


app.get("/api/posts", async (req, res) => {
  const posts = await filemodal.find({orderBy: [{ created: 'desc'}]})
  for (let post of posts) {
    post.photoUrl = await getObjectSignedUrl(post.photoUrl)
  }
  res.send(posts)
})



app.listen(8080, () => console.log("listening on port 8080"))