
import { possibleWords, allWords } from "./words.js"
/**********************************************************************************
                                    Grabbing elements 
****************************************************************************** */
const firstRowLetter = document.getElementsByClassName('first-row-tiles')
const secondRowLetter = document.getElementsByClassName('second-row-tiles')
const thirdRowLetter = document.getElementsByClassName('third-row-tiles')
const fourthRowLetter = document.getElementsByClassName('fourth-row-tiles')
const fifthRowLetter = document.getElementsByClassName('fifth-row-tiles')
const sixthRowLetter = document.getElementsByClassName('sixth-row-tiles')
const everyLetterKey = document.getElementsByClassName('letter-keys')
const deleteButtonKeyboard = document.getElementById('delete-key')
const enterButtonKeyboard = document.getElementById('enter-key')
const informationContainer = document.getElementById('not-a-word-warning')
const statDisplays = document.querySelectorAll('.stat-displays')
const wordLength = 5
const maxRounds = 6
/************************************************************************************
                                    Game Variables 
 ************************************************************************************/

async function getWord() {
    const res = await fetch('https://josephcalise.com/wotd/word')
    const wordOfTheDay = res.json()
    return wordOfTheDay
}

const correctWord = await getWord()



async function postUserStats(id) {
    const res = await fetch(`https://josephcalise.com/wotd/${id}`)
    const userStats = await res.json()
    const userStatsArr = []
    userStatsArr.push(userStats.attempted)
    userStatsArr.push(userStats.solved)
    userStatsArr.push(userStats.failed)
    userStatsArr.push(userStats.totalGuesses)
    userStatsArr.push((userStats.totalGuesses / userStats.solved).toFixed(3))
    userStatsArr.push(userStats.streak)
    for (let i = 0; i < userStatsArr.length; i++) {
        const writeStat = statDisplays[i].appendChild(document.createElement('p'))
        writeStat.textContent = userStatsArr[i]

    }
}

const coundownTimer = document.getElementById("time-left");

setInterval(function () {
    var toDate = new Date();
    var tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    var diffMS = tomorrow.getTime() / 1000 - toDate.getTime() / 1000;
    var diffHr = Math.floor(diffMS / 3600);
    diffMS = diffMS - diffHr * 3600;
    var diffMi = Math.floor(diffMS / 60);
    diffMS = diffMS - diffMi * 60;
    var diffS = Math.floor(diffMS);
    var result = ((diffHr < 10) ? "0" + diffHr : diffHr);
    result += ":" + ((diffMi < 10) ? "0" + diffMi : diffMi);
    result += ":" + ((diffS < 10) ? "0" + diffS : diffS);
    coundownTimer.innerHTML = result;

}, 1000);



async function fillGameBoard() {

}



if (localStorage.getItem("userID") != null) {
    let leaderboard;
    const res = await fetch(`https://josephcalise.com/wotd/${localStorage.getItem("userID")}`)
    const userStats = await res.json()
    if (userStats.completedToday == true) {
        postUserStats(localStorage.getItem("userID"))
        if (localStorage.getItem("userGroup") != null) {
            leaderboard = await getLeaderboardData(localStorage.getItem("userGroup"))
            console.log(leaderboard)
            leaderboard.sort((a, b) => { return (a.totalGuesses / a.solved) - (b.totalGuesses / b.solved) })
            console.log(leaderboard)
            loadLeaderboardData(leaderboard)
            const access = document.getElementById('access-code-container')
            access.remove()
            document.getElementById("leader-board-header").classList.remove("hidden")
            document.getElementById("leader-board-grid").classList.remove("hidden")
            document.getElementById("solved-countdown").classList.remove("hidden")
            //} else if (true) {
            //This should be started game and fill out the board)


        } else {
            await getUserName()
        }
        document.getElementById("end-game-container").classList.remove("hidden")
    }
}


const correctWordArray = correctWord.toUpperCase().split('')
console.log(allWords.indexOf(correctWord) > -1)
const correctWordHashTable = {}
let userGuessArray = []
let currentGameBoard = []
let currentRound = 1;
let currentPlayer = localStorage.getItem("userID");
const green = 'rgb(0, 128, 0)'
const yellow = 'rgb(179, 155, 2)'
const grey = 'rgb(128, 128, 128)'

var date = new Date().toLocaleDateString("en-US", {
    "year": "numeric",
    "month": "numeric",
    "day": "numeric"
});

let data = { userID: currentPlayer, guessesMade: currentRound, currentDate: date, currentGameBoard: currentGameBoard };

const getInconspicuousVariable = async () => {
    const res = await fetch('https://josephcalise.com/wotd/groups')
    const validGroups = await res.json()
    return validGroups
}
const inconspicuousVariable = await getInconspicuousVariable()

//create hashtable for tracking repeat letters
const repeatTracker = {}
for (let i = 0; i < 5; i++) {
    if (repeatTracker[correctWordArray[i]] == undefined) {
        repeatTracker[correctWordArray[i]] = 1
    } else {
        repeatTracker[correctWordArray[i]] += 1
    }
}
let clonedRepeatTracker = structuredClone(repeatTracker)
/***********************************************************************************
                                    Functions
************************************************************************************/

function addLetterToTile(letter, currentRowBeingPlayed) {
    if (userGuessArray.length < wordLength) {
        userGuessArray.push(letter)
        const targetTile = currentRowBeingPlayed[userGuessArray.length - 1].querySelector('p')
        targetTile.innerHTML = userGuessArray[userGuessArray.length - 1]
    }
}

function checkForCorrectlyPlacedLetters() {
    let tileColorArray = ['', '', '', '', '']
    for (let i = 0; i < 5; i++) {
        if (userGuessArray[i] == correctWordArray[i]) {
            tileColorArray[i] = green
            clonedRepeatTracker[userGuessArray[i]]--
        }
    }
    return tileColorArray
}

function finishTileColorArray(tileColorArray) {
    for (let i = 0; i < 5; i++) {
        if (tileColorArray[i] != green) {
            if (correctWordArray.indexOf(userGuessArray[i]) > -1 && clonedRepeatTracker[userGuessArray[i]] > 0) {
                tileColorArray[i] = yellow
                clonedRepeatTracker[userGuessArray[i]]--
            } else {
                tileColorArray[i] = grey
            }
        }
    }
    clonedRepeatTracker = structuredClone(repeatTracker)
    return tileColorArray
}

function userSubmitsWord() {
    let completeTileColors = finishTileColorArray(checkForCorrectlyPlacedLetters())
    return completeTileColors
}

function changeTileColor(tileColorArray) {
    let targetRow = checkRoundReturnRow()
    for (let i = 0; i < 5; i++) {
        targetRow[i].style.backgroundColor = `${tileColorArray[i]}`
    }
}

function changeKeyboardColors(tileColorArray) {
    let currentRound = checkRoundReturnRow()
    const genericKeyboardIDs = '-key-keyboard'
    for (let i = 0; i < 5; i++) {
        let letterKey = `${userGuessArray[i].toLowerCase()}${genericKeyboardIDs}`
        let letterKeyID = document.getElementById(letterKey)
        let currentBackgroundColor = window.getComputedStyle(letterKeyID).backgroundColor
        if (currentBackgroundColor == 'rgb(0, 0, 0)') {
            letterKeyID.style.backgroundColor = tileColorArray[i]
        } else if (tileColorArray[i] == green) {
            letterKeyID.style.backgroundColor = tileColorArray[i]
        }
    }
}

const recieveNewId = async () => {
    const res = await fetch('https://josephcalise.com/wotd/nouser')
    const madeid = await res.json()
    return madeid
}
//This will post request to /success and increments all the positive stuff
function postRequestSuccess(data) {
    fetch('https://josephcalise.com/wotd/success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then((res) => { console.log(res.json) })
        .catch((err) => console.log(err));
}
//This will send a post request to /failed and reset streak and increment other things like failed.
function postRequestFailed(data) {
    fetch('https://josephcalise.com/wotd/failed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then((res) => { console.log(res.json) })
        .catch((err) => console.log(err));
}



//need to split everything into async function, name first then accesscode then yes/no



async function getUserName() {
    document.getElementById("submit-name").addEventListener('click', () => {
        const userName = document.getElementById("submit-name-input").value
        data.name = userName
        localStorage.setItem("userGroup", data.group)
        const fullContainer = document.getElementById("access-code-container")
        const lbheader = document.getElementById("leader-board-header")
        const lbgrid = document.getElementById("leader-board-grid")
        const nameInputContainer = document.getElementById("name-input-or-failed")
        nameInputContainer.remove()
        lbheader.remove()
        lbgrid.remove()
        const groupUpdateNotice = document.createElement('h5')
        groupUpdateNotice.textContent = "Your group has been added.\nThe leaderboard will be loaded the next time you play."
        groupUpdateNotice.classList.add("group-update")
        fullContainer.appendChild(groupUpdateNotice)
        document.getElementById("solved-countdown").classList.remove("hidden")

        //need to add a POST request to update user group and name 
        fetch('https://josephcalise.com/wotd/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then((res) => { console.log(res.json) })
            .catch((err) => console.log(err));
    })
    await getAccessCode()
}

async function getAccessCode() {
    const accessCodeContainer = document.getElementById('access-code-input-container')
    document.getElementById("submit-access-code").addEventListener("click", () => {
        const groupCode = document.getElementById("access-code-input").value
        if (inconspicuousVariable.indexOf(groupCode) > -1) {
            data.group = groupCode
            accessCodeContainer.remove()
            document.getElementById("name-input-or-failed").classList.remove("hidden")
        } else {
            console.log(document.querySelector('.cancel-button'))
            if (document.querySelector('.cancel') == null) {
                document.getElementById("access-code-label").textContent = "Please enter a valid code:"
                const cancelButton = document.createElement('button')
                cancelButton.classList.add("access-button")
                cancelButton.classList.add("cancel-button")
                cancelButton.textContent = 'Cancel'
                document.getElementById("access-code-input-container").appendChild(cancelButton)
                cancelButton.addEventListener('click', () => {
                    const accessInput = document.getElementById("access-code-input")
                    const accessSubmit = document.getElementById("submit-access-code")
                    accessInput.remove()
                    accessSubmit.remove()
                    cancelButton.remove()
                    document.getElementById("access-code-label").textContent = "Access codes allow you to compete with your friends via leaderboards."
                    const para = document.createElement('h4')
                    para.textContent = 'Request a code for you and your friends by emailing calisejoey@gmail.com'
                    para.classList.add("access-code-headers")
                    document.getElementById("access-code-input-container").appendChild(para)
                    console.log(document.querySelector('.cancel-button'))
                })
            }
        }
    })
    await queryAccessCode()
}

async function queryAccessCode() {
    const yesButton = document.getElementById("has-access-code")
    document.getElementById("no-access-code").addEventListener('click', () => {
        const buttons = document.getElementById("access-buttons")
        const codeInput = document.getElementById("access-code-input-container")
        const nameInput = document.getElementById("name-input-or-failed")
        buttons.remove()
        codeInput.remove()
        nameInput.remove()
        document.getElementById("access-h3").textContent = "Access codes allow you to compete with your friends via leaderboards."
        const para = document.createElement('h4')
        para.textContent = 'Request a code for you and your friends by emailing calisejoey@gmail.com'
        para.classList.add("access-code-headers")
        document.getElementById("access-code-container").appendChild(para)
    })
    yesButton.addEventListener('click', () => {
        const accessButtons = document.getElementById("access-code-buttons-container")
        accessButtons.remove()
        document.getElementById('access-code-input-container').classList.remove("hidden")
    })
}


async function loadUserStatsSuccess(id, data) {
    const res = await fetch(`https://josephcalise.com/wotd/${id}`)
    const userStats = await res.json()
    const userStatsArr = []
    userStatsArr.push(userStats.attempted)
    userStatsArr.push(userStats.solved)
    userStatsArr.push(userStats.failed)
    userStatsArr.push(userStats.totalGuesses)
    userStatsArr.push((userStats.totalGuesses / userStats.solved).toFixed(3))
    userStatsArr.push(userStats.streak)
    for (let i = 0; i < userStatsArr.length; i++) {
        const writeStat = statDisplays[i].appendChild(document.createElement('p'))
        writeStat.textContent = userStatsArr[i]
    }
}

async function loadUserStatsFailed(id, data) {
    const res = await fetch(`https://josephcalise.com/wotd/${id}`)
    const userStats = await res.json()
    const userStatsArr = []
    userStatsArr.push(userStats.attempted)
    userStatsArr.push(userStats.solved)
    userStatsArr.push(userStats.failed)
    userStatsArr.push(userStats.totalGuesses)
    userStatsArr.push((userStats.totalGuesses / userStats.solved).toFixed(3))
    userStatsArr.push(userStats.streak)
    for (let i = 0; i < userStatsArr.length; i++) {
        const writeStat = statDisplays[i].appendChild(document.createElement('p'))
        writeStat.textContent = userStatsArr[i]

    }
}



async function getLeaderboardData(group) {
    const res = await fetch(`https://josephcalise.com/wotd/leaderboard/${group}`)
    const groupStats = await res.json()
    return groupStats
}

function loadLeaderboardData(leaderboard) {
    let leaderArr = []
    for (let person of leaderboard) {
        let personArr = []
        personArr.push(person.name)
        personArr.push((person.totalGuesses / person.solved).toFixed(3))
        personArr.push(person.solved)
        personArr.push(person.streak)
        leaderArr.push(personArr)
    }
    const boxes = document.querySelectorAll('.user-box');
    for (let box of boxes) {
        let child = document.createElement('p')
        box.appendChild(child)
    }
    const first = document.querySelectorAll('.first-place p');
    for (let i = 0; i < leaderArr[0].length; i++) {
        first[i].textContent = leaderArr[0][i]
    }
    if (leaderArr[1] != undefined) {
        const second = document.querySelectorAll('.second-place p');
        for (let i = 0; i < leaderArr[1].length; i++) {
            second[i].textContent = leaderArr[1][i]
        }
    }
    if (leaderArr[2] != undefined) {
        const third = document.querySelectorAll('.third-place p');
        for (let i = 0; i < leaderArr[2].length; i++) {
            third[i].textContent = leaderArr[2][i]
        }
    }
    if (leaderArr[3] != undefined) {
        const fourth = document.querySelectorAll('.fourth-place p');
        for (let i = 0; i < leaderArr[3].length; i++) {
            fourth[i].textContent = leaderArr[3][i]
        }
    }
    if (leaderArr[4] != undefined) {
        const fifth = document.querySelectorAll('.fifth-place p');
        for (let i = 0; i < leaderArr[4].length; i++) {
            fifth[i].textContent = leaderArr[4][i]
        }
    }
    if (leaderArr[5] != undefined) {
        const fifth = document.querySelectorAll('.sixth-place p');
        for (let i = 0; i < leaderArr[5].length; i++) {
            fifth[i].textContent = leaderArr[5][i]
        }
    }

}




//post user data
//display the users data
//ask about groups
//post group stats
//query group stats
//display group stats


const checkGameEnd = async () => {
    let leaderboard;
    data.userID = localStorage.getItem("userID")
    if (userGuessArray.join('') == correctWordArray.join('')) {
        await postRequestSuccess(data)
        setTimeout(() => { loadUserStatsSuccess(currentPlayer, data) }, 50)
        if (localStorage.getItem("userGroup") != null) {
            setTimeout(async () => {
                leaderboard = await getLeaderboardData(localStorage.getItem("userGroup"))
                console.log(leaderboard)
                leaderboard.sort((a, b) => { return (a.totalGuesses / a.solved) - (b.totalGuesses / b.solved) })
                console.log(leaderboard)
                loadLeaderboardData(leaderboard)
                document.getElementById("leader-board-header").classList.remove("hidden")
                document.getElementById("leader-board-grid").classList.remove("hidden")
                document.getElementById("solved-countdown").classList.remove("hidden")
            }, 75)
            const access = document.getElementById('access-code-container')
            access.remove()
        } else {
            await getUserName()
        }
        document.getElementById('end-game-container').classList.remove('hidden')
    } else if (currentRound == maxRounds) {
        await postRequestFailed(data)
        setTimeout(() => { loadUserStatsFailed(currentPlayer, data) }, 50)
        if (localStorage.getItem("userGroup") != null) {
            setTimeout(async () => {
                leaderboard = await getLeaderboardData(localStorage.getItem("userGroup"))
                console.log(leaderboard)
                leaderboard.sort((a, b) => { return (a.totalGuesses / a.solved) - (b.totalGuesses / b.solved) })
                console.log(leaderboard)
                loadLeaderboardData(leaderboard)
                document.getElementById("leader-board-header").classList.remove("hidden")
                document.getElementById("leader-board-grid").classList.remove("hidden")
                document.getElementById("solved-countdown").classList.remove("hidden")
            }, 75)
            const access = document.getElementById('access-code-container')
            access.remove()
        } else {
            await getUserName()
        }
        document.getElementById('end-game-container').classList.remove('hidden')
    } else {
        currentRound++
        data.guessesMade++
        userGuessArray.length = 0
    }
}



function deleteButtonFunctionality() {
    let currentRound = checkRoundReturnRow()
    if (userGuessArray.length > 0) {
        let targetTile = currentRound[userGuessArray.length - 1].querySelector('p')
        targetTile.innerHTML = ''
        userGuessArray.pop()
    }
}

function checkRoundReturnRow() {
    if (currentRound == 1) {
        return firstRowLetter
    } else if (currentRound == 2) {
        return secondRowLetter
    } else if (currentRound == 3) {
        return thirdRowLetter
    } else if (currentRound == 4) {
        return fourthRowLetter
    } else if (currentRound == 5) {
        return fifthRowLetter
    } else if (currentRound == 6) {
        return sixthRowLetter
    }
}





/**********************************************************************************
                                Event Listeners
*************************************************************************************/




for (let key of everyLetterKey) {
    const letterPressed = key.querySelector('p').innerHTML
    const events = ['click', 'ontouchstart']
    events.forEach(evt =>
        key.addEventListener(evt, () => {
            let currentRowBeingPlayed = checkRoundReturnRow()
            addLetterToTile(letterPressed, currentRowBeingPlayed)
        }), false)


    //key.addEventListener('click', () => {
    //    let currentRowBeingPlayed = checkRoundReturnRow()
    //    addLetterToTile(letterPressed, currentRowBeingPlayed)
    //})
}
async function pusharr(arr) {
    await currentGameBoard.push(arr)
    console.log(currentGameBoard)
}

//enter is where we check for a returning user or if we need to make a user
//also checks word length and holds all tile color changes
enterButtonKeyboard.addEventListener('click', async () => {
    //This conditional is placed to check for a returning player against the DB
    if (localStorage.getItem('userID') == null) {
        const newlyMadePlayer = await recieveNewId()
        currentPlayer = await newlyMadePlayer._id
        localStorage.setItem("userID", `${currentPlayer}`)
    }
    if (userGuessArray.length != wordLength) {
        alert('You must enter a 5 letter word!')
    } else if (allWords.indexOf(userGuessArray.join('').toLowerCase()) == -1) {
        informationContainer.innerHTML = `${userGuessArray.join('').toLowerCase()} is not a word.`
        informationContainer.style.transition = 'opacity 3s'
        informationContainer.style.opacity = '1'
        setTimeout(() => {
            informationContainer.style.opacity = '0'
        }, 2000)
    } else {
        let tileColors = userSubmitsWord()
        changeTileColor(tileColors)
        changeKeyboardColors(tileColors)
        setTimeout(checkGameEnd, 500)
    }
})

deleteButtonKeyboard.addEventListener('click', () => {
    deleteButtonFunctionality()
})


//data persist for logoff 
//arr of keys with event listeners 
//each key has an array with key status
//mongoDB query for last session
//figure out the guess away and lock it with something in the DB



