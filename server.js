const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path');
const bodyParser = require('body-parser')
let cron = require('node-cron')
const { possibleWords } = require('./config/words')
const connectDB = require('./config/db')
const User = require('./models/User');
const Words = require('./models/Words')
const app = express();


app.use(express.static(path.join(__dirname, 'public_site')))
app.use("/wotd", express.static(path.join(__dirname, 'public_wotd')))
dotenv.config({ path: './config/config.env' })
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`) })
connectDB()






app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


async function getLastWordOfTheDay() {
    const eyeD = "62febf7ab03909b68dd5fd6f"
    const usedWords = await Words.findById(eyeD)
    wordOfTheDay = await usedWords.usedWords[usedWords.usedWords.length - 1]
}


let wordOfTheDay;
getLastWordOfTheDay()



async function queryDBWords() {
    const DBWords = await Words.find()
    return DBWords[0].possibleWords
}


async function chooseWordFromDBList() {
    const wordsDBId = "62febf7ab03909b68dd5fd6f"
    const DBWordOptions = await queryDBWords()
    const index = Math.floor(Math.random() * (DBWordOptions.length + 1))
    wordOfTheDay = DBWordOptions[index]
    DBWordOptions.splice(index, 1)
    console.log(wordOfTheDay)
    await updateWordsDB(wordsDBId, wordOfTheDay)
    return wordOfTheDay
}

async function updateWordsDB(id, word) {
    const mainDBWords = await Words.findById(id)
    mainDBWords.possibleWords.pull(word)
    mainDBWords.usedWords.push(word)
    mainDBWords.save()
}


async function switchPlayedToday() {
    await checkStreaks()
    try {
        await User.updateMany({ completedToday: true }, { $set: { completedToday: false } })
        console.log("Everyone is false now.")
    } catch (err) {
        console.log(err.message)
    }
}

async function checkStreaks() {
    try {
        await User.updateMany({ completedToday: false }, { $set: { streak: 0 } })
        console.log("Swapped all the missed people.")
    } catch (err) {
        console.log(err.message)
    }

}

//Words.create({ possibleWords: possibleWords, usedWords: [] })





cron.schedule('0 0 * * *', () => {
    switchPlayedToday()
    wordOfTheDay = chooseWordFromDBList()
}, { timezone: "US/Pacific" })



//This needs to go in Cron once we figure out how to shift DB




async function makeNewUser() {
    try {
        const newUser = await User.create({ name: "placehold" })
        return newUser
    } catch (err) {
        console.log(err.message)
    }
}






app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/wotd/word', (req, res) => {
    res.json(wordOfTheDay).status(200)
}, (err) => {
    console.log(err)
})



app.get('/wotd/groups', async (req, res) => {
    const validGroups = await process.env.ACCESSCODES.split(' ')
    res.json(validGroups)
})

app.get('/wotd/nouser', async (req, res) => {
    const newUserID = await makeNewUser()
    res.json(newUserID)
})


app.get('/wotd/:userID', async (req, res) => {
    const user = req.params.userID
    const userStats = await User.findById(user)
    res.json(userStats)
})

app.get('/wotd/leaderboard/:groupID', async (req, res) => {
    const group = req.params.groupID
    const groupStats = await User.find({ group: group })
    await res.json(groupStats).status(200)
})

app.post('/wotd/success', async (req, res) => {
    try {
        const userID = req.body.userID
        const guessesMade = req.body.guessesMade
        const lastPlayedDate = req.body.currentDate
        console.log(req.body.currentGameBoard)
        User.findByIdAndUpdate(userID, {
            $inc: {
                totalGuesses: guessesMade,
                attempted: 1,
                streak: 1,
                solved: 1
            },
            $set: {
                completedToday: true,
                lastPlayed: lastPlayedDate
            }
        }, (err, res) => {
            if (err) {
                console.log(err.message)
            } else {
                console.log("Success: success")
            }
        })
    } catch (err) {
        console.log(err.message)
    }
})

app.post('/wotd/failed', async (req, res) => {
    try {
        const userID = req.body.userID
        const lastPlayedDate = req.body.currentDate
        User.findByIdAndUpdate(userID,
            {
                $set: { streak: 0, completedToday: true, lastPlayed: lastPlayedDate },
                $inc: { attempted: 1, failed: 1, missed: 1, totalGuesses: 8 }
            }
            , (err, res) => {
                if (err) {
                    console.log(err.message)
                } else {
                    console.log("Failed: success")
                }
            })

        res.status(200)
    } catch (err) {
        console.log(err.message)
    }
})


app.post('/wotd/group', async (req, res) => {
    try {
        const userID = req.body.userID
        const name = req.body.name
        const group = req.body.group
        User.findByIdAndUpdate(userID,
            {
                $set: { name: name, group: group },
            }
            , (err, res) => {
                if (err) {
                    console.log(err.message)
                } else {
                    console.log(`Updated group to ${group} and name to ${name}.`)
                }
            })

        res.status(200)
    } catch (err) {
        console.log(err.message)
    }
})

//hard to figure out when i should make a new user because of bots













