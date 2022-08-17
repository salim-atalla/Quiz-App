


let html;
let currentQuestionIndex = 0;
let goodAnswers = 0;
let totalQuestionsNumber;
let timeCode;
const duration = 90; // In seconds


const api = "https://the-trivia-api.com/api/questions"; // online api

// Use the local api for offline testing
// const api = "../json/quiz.json"; // offline api





function getData () {
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let data = JSON.parse(request.responseText); 

            // Get questions number
            totalQuestionsNumber = data.length;
            html.questionTotalNumberHeading.innerHTML = totalQuestionsNumber;
            // Get category + question number (current/total)
            html.category.innerHTML = data[currentQuestionIndex].category;
            html.questionCurrentNumberHeading.innerHTML = currentQuestionIndex + 1;

            // Setup
            setupBullets();
            pushQuestion(data[currentQuestionIndex]);
            handleTime(duration);
            handelChoices();

            // Submit listener
            html.submit.onclick = (event) => {
                if (currentQuestionIndex < totalQuestionsNumber) {
                    // Get category + question number (current/total)
                    html.category.innerHTML = data[currentQuestionIndex].category;
                    html.questionCurrentNumberHeading.innerHTML = currentQuestionIndex + 1;

                    checkAnswer(data[currentQuestionIndex-1]);
                    handleBullets();
                    pushQuestion(data[currentQuestionIndex]);
                    handelChoices();
                    clearInterval(timeCode);
                    handleTime(duration); 
                } else {
                    checkAnswer(data[currentQuestionIndex-1]);
                    pushResultView();
                }
            };
        }
    }
    request.open("GET", api, true);
    request.send();
}



// Functions
function pushQuestion (q) {
    if (currentQuestionIndex < totalQuestionsNumber) {
        // Push question number
        html.questionCurrentNumber.innerHTML = currentQuestionIndex + 1;
        // Push question text
        html.questionText.innerHTML = q.question;

        // Get answers array
        let ansArray = getAnswersArray(q);

        // Empty answers space
        html.answers.innerHTML = "";

        // Create answers containers
        for (let i = 0; i < ansArray.length; i++) {
            // Create a div container
            let ansDiv = document.createElement("div");
            ansDiv.classList.add("answer");
            // Add answer div to the answers container
            html.answers.appendChild(ansDiv);
        
            // create a radio input
            let radioInput = document.createElement("input");
            // Give input classes: id + type + name
            radioInput.setAttribute("id", `answer-${i+1}`);
            radioInput.setAttribute("type", `radio`);
            radioInput.setAttribute("name", `choice`);

            // Add radio input to its answer div
            ansDiv.appendChild(radioInput);

            // Create a label for the radio input
            let ansLabel = document.createElement("label");
            ansLabel.htmlFor = `answer-${i+1}`;
            // Add the answer text to the label
            ansLabel.appendChild(document.createTextNode(ansArray[i]));
            // Add answer label to its answer div
            ansDiv.appendChild(ansLabel);
        }
        currentQuestionIndex++;
    }
}

function getAnswersArray (q) {
    let ansArray = q.incorrectAnswers;
    ansArray.push(q.correctAnswer);
    ansArray.sort(() => (Math.random() - 0.5).toString());
    return ansArray;
}

function setupBullets () {
    // Create spans for the number of questions
    for (let i = 0; i < totalQuestionsNumber; i++) {
        let bullet = document.createElement("span");
        html.bullets.appendChild(bullet);
    }
    handleBullets();
}

function handleBullets () {
    html.bullets.childNodes[currentQuestionIndex].className = "done";
}

function handleTime (duration) {
    let min = Math.floor(duration / 60);
    let sec = Math.floor(duration % 60);
    
    timeCode = setInterval(() => {
        if (min < 10) {
            html.minutes.innerHTML = `0${min}`;
        } else {
            html.minutes.innerHTML = min;
        }
        if (sec < 10) {
            html.seconds.innerHTML = `0${sec}`;
        } else {
            html.seconds.innerHTML = sec;
        }

        if (sec > 0) {
            sec--;
        } else {
            if (min > 0) {
                min--;
                sec = 60;
            } else {
                clearInterval(timeCode);
                html.submit.click();
            }
        }
    }, 1000);

}

function handelChoices () {
    html.answers.childNodes.forEach((answer) => {
        answer.onclick = (event) => {
            // Remove "selected" class from all answers
            html.answers.childNodes.forEach((answer) => {
                answer.classList.remove("selected");
            });
            // Add "selected" class to the clicked answer
            answer.classList.add("selected");
            answer.querySelector("input").checked = true;
        }
    });
}

function checkAnswer (q) {
    let selectedAnswer = document.body.querySelector(".answer.selected label");
    if (selectedAnswer != null) {
        if (selectedAnswer.textContent === q.correctAnswer) {
            goodAnswers++;
        }
    }
}



// Views setups
function pushStartView () {
    let startView = `
        <div class="start-page">
            <h1>Quiz App</h1>
            <button class="start-btn">Start</button>
        </div>
    `;

    document.querySelector(".container").innerHTML = startView;
}

document.addEventListener("click", (event) => {
    if (event.target.className === "start-btn") {
        pushQuestionsView();
    }
    if (event.target.className === "restart-btn") {
        restartQuiz();
    }
});

function pushQuestionsView () {
    let questionsView = `
        <div class="content">
            <div class="info">
                <div class="category">Category: <span></span></div>
                <div class="q-counter">Question <span class="current"></span>/<span class="total"></span></div>
            </div>
            <div class="q-box">
                <div class="question">
                    <h3>Question <span></span></h3>
                    <p></p>
                </div>
                <div class="answers"></div>
                <div class="submit-btn">
                    <button>Submit</button>
                </div>
            </div>
            <div class="bullets">
                <div class="spans"></div>
                <div class="time-counter">
                    <span class="minutes"></span>:<span class="seconds"></span>
                </div>
            </div>
        </div>
    `;
    document.querySelector(".container").innerHTML = questionsView;
    html = {
        questionCurrentNumberHeading: document.querySelector(".info .q-counter .current"),
        questionTotalNumberHeading: document.querySelector(".info .q-counter .total"),
        category: document.querySelector(".info .category span"),
    
        questionText: document.querySelector(".question p"),
        questionCurrentNumber: document.querySelector(".question h3 span"),
        answers: document.querySelector(".answers"),
        bullets: document.querySelector(".bullets .spans"),
    
        minutes: document.querySelector(".bullets .time-counter .minutes"),
        seconds: document.querySelector(".bullets .time-counter .seconds"),
    
        submit: document.querySelector(".q-box .submit-btn button")
    };
    getData();
}

function pushResultView () {
    let resultVieu = `
        <div class="result-page">
            <h1>You Have Answered<br>${goodAnswers} / ${totalQuestionsNumber}<br>Questions</h1>
            <button class="restart-btn">Restart</button>
        </div>
    `;
    document.querySelector(".container").innerHTML = resultVieu;
}

function restartQuiz () {
    currentQuestionIndex = 0;
    goodAnswers = 0;
    pushStartView();
}



// Run
pushStartView();