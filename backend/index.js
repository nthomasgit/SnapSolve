const express = require('express');

const mongoose = require('mongoose');

const url =
  'mongodb+srv://group5capstone2024:abc2024@cluster0.5apodqf.mongodb.net/snapsolve';
const path = require('path');
const bodyParser = require('body-parser');
const port = 3001;
const app = express();
const multer = require('multer');
const Worker = require('./model/worker');
const UserAvailability = require('./model/avaibility');
const Booking = require('./model/booking');
const Review = require('./model/review');
const Rating = require('./model/rating');
const { Channel, Message } = require('./model/channel');
const cors = require('cors');
const http = require('http').Server(app);
const socketIo = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

// const server = http.createServer(app);
// const io = socketIo(server);
// const io = socketIo();
app.use(bodyParser.json());
app.use(cors());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('uploads'));

//connection to dbms
mongoose
  .connect(url)
  .then(() => {
    console.log('connected to database');
  })
  .catch((err) => {
    console.log('having an error while connecting', err);
  });

// Define storage for the images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post(
  '/workers/create-worker',
  upload.single('profilePic'),
  async (req, res) => {
    // Handle file upload

    const { path } = req.file;
    const {
      name,
      age,
      profession,
      experience,
      description,
      charges,
      currentUser,
    } = req.body;

    // Check if currentUser is null
    if (!currentUser) {
      return res.status(400).send('currentUser is required');
    }

    // Check if a worker with the given currentUser already exists
    const existingWorker = await Worker.findOne({ currentUser });
    // console.log(existingWorker,"It is an existing worker");
    if (existingWorker) {
      return res.status(200).send('Worker is already existing');
    }

    // Create a worker instance and save to MongoDB
    try {
      const worker = new Worker({
        name,
        age,
        profession,
        experience,
        description,
        charges,
        currentUser,
        profilePic: path, // Save file path in MongoDB
      });
      await worker.save();
      res.status(201).send('Worker created successfully');
    } catch (error) {
      console.log('error for worker creation', error);
      res.status(400).send('Error creating worker');
    }
  }
);

app.post('/api/availability', async (req, res) => {
  const { user, availability } = req.body;

  try {
    // Check if availability for the user already exists
    const existingAvailability = await UserAvailability.findOne({ user: user });

    if (existingAvailability) {
      // Update the existing availability
      const updatedAvailability = await UserAvailability.findOneAndUpdate(
        { user: user }, // search query
        { availability: availability }, // update values
        { new: true } // options: return the updated document
      );

      res.status(200).send('Availability data updated successfully');
    } else {
      // If no existing availability, create a new one
      const newAvailability = new UserAvailability({
        user,
        availability,
      });
      await newAvailability.save();
      console.log('Availability data saved:', newAvailability);
      res.status(201).send('Availability data saved successfully');
    }
  } catch (error) {
    console.error('Error handling availability data:', error);
    res.status(500).send('Error handling availability data');
  }
});

app.get('/employeelist', async (req, res) => {
  try {
    const workers = await Worker.find(
      {},
      {
        name: 1,
        profession: 1,
        charges: 1,
        currentUser: 1,
        profilePic: 1,
        _id: 0,
      }
    );

    res.status(200).json(workers);
  } catch (error) {
    console.log('error while fetching workers', error);
    res.status(500).send('Error fetching workers');
  }
});

app.get('/employeelist/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('category', category);
    const workers = await Worker.find(
      { profession: category },
      {
        name: 1,
        profession: 1,
        charges: 1,
        currentUser: 1,
        profilePic: 1,
        _id: 0,
      }
    );
    res.status(200).json(workers);
  } catch (err) {
    console.log(
      'Error while fetching employeelist on the basis of category',
      err
    );
    res.status(500).send('Error fetching workers on basis of category');
  }
});

app.get('/employee/:currentUser', async (req, res) => {
  const { currentUser } = req.params;

  try {
    const employee = await Worker.findOne({ currentUser });
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).send('Error fetching employee details');
  }
});

app.post('/api/booking', async (req, res) => {
  const { service, address, date, time, issue, requester, recipient } =
    req.body;

  // Check if requester and recipient are the same
  if (requester === recipient) {
    return res.status(400).send('Cannot make a request to yourself');
  }

  try {
    const booking = new Booking({
      service,
      address,
      date,
      time,
      issue,
      requester,
      recipient,
    });
    await booking.save();
    res.status(201).send('Booking request created');
  } catch (err) {
    console.error('Error creating booking request', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/messages', async (req, res) => {
  const { user1Id, user2Id, messageContent } = req.body;

  try {
    let channel = await Channel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!channel) {
      // If channel doesn't exist, generate a random channelId and create a new channel
      const newChannelId = Math.floor(Math.random() * 1000000); // Random channel ID
      channel = await Channel.create({
        user1: user1Id,
        user2: user2Id,
        channelId: newChannelId,
      });
    }

    // Store the message in the messages collection
    const newMessage = await Message.create({
      channelId: channel.channelId,
      sender: user1Id,
      message: messageContent,
    });

    // socketIo.emit('chat-message', newMessage);

    res
      .status(200)
      .json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const { user1Id, user2Id } = req.query;
    const channel = await Channel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });
    // console.log(channel,"channel");

    if (!channel) {
      return res.status(404).send('Channel not found');
    }

    const channelId = channel.channelId;

    const messages = await Message.find({ channelId });
    // console.log("messages",messages);
    if (messages) {
      res.status(200).send(messages);
    } else {
      res.status(201).send('Conversation has not started yet');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server Error');
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const { user } = req.query;

    if (user == null) {
      res.status(404).send('user does not exist');
    } else {
      const requestDetails = await Booking.find({ recipient: user });
      if (requestDetails == null) {
        res.status(201).send('Did not get any requests');
      } else {
        console.log('tasks', requestDetails);
        res.status(200).send(requestDetails);
      }
    }
  } catch (err) {
    console.log('error while fetching requests', err);
  }
});

app.post('/api/updateStatus', async (req, res) => {
  const { taskid, action } = req.body;
  if (!taskid) {
    console.log('taskid', taskid);
    return res.status(400).send('Taskid is required');
  }

  try {
    const updatedTask = await Booking.findByIdAndUpdate(
      taskid,
      { status: action },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).send('Booking not found');
    }

    res.status(200).send(updatedTask);
  } catch (err) {
    console.error('Error while updating task status', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { user } = req.query;

    if (user == null) {
      res.status(404).send('user does not exist');
    } else {
      const requestDetails = await Booking.find({ requester: user });
      if (requestDetails == null) {
        res.status(201).send('Did not get any bookings from this user');
      } else {
        console.log('requestDetails', requestDetails);
        res.status(200).send(requestDetails);
      }
    }
  } catch (err) {
    console.log('Error while fetching Bookings', err);
  }
});

app.post('/api/review', async (req, res) => {
  const { taskid, receiver, rating, review } = req.body;
  try {
    const newRating = new Rating({
      user: receiver,
      rating: rating,
      taskid,
    });

    await newRating.save();

    const newReview = new Review({
      taskid,
      rating,
      review,
    });

    await newReview.save();

    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.log('Facing an error while storing data in database', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/rating', async (req, res) => {
  try {
    const { user } = req.query;
    console.log('curremtUser', user);
    const userRating = await Rating.find({ user });
    let totalRating = 0;
    userRating.map((user) => (totalRating = totalRating + user.rating));
    const ratingLenght = userRating.length;
    const avg = totalRating / ratingLenght;

    const data = { user, avgRating: avg.toString() };

    res.status(200).json(data);
  } catch (err) {
    console.log('HAving an error while fetching rating', err);
    res.status(500).send('Internal server error');
  }
});

socketIo.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('message', (message) => {
    console.log(message);
    socketIo.emit('messageResponse', message);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(port, () => {
  console.log('Server is listening on port number:', port);
});
