// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let score=0;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds(NUM_CATEGORIES) {
    try{
        let response= await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories?count=${NUM_CATEGORIES}`);
        let fetchedCategories=response.data;
        return fetchedCategories.map(category => category.id);
    }catch (error){
        console.error('Error fetching categories:', error);
    };
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    try{
        let response= await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
        let category=response.data;
        let clues=category.clues.map(clue => ({
            question:clue.question,
            answer:clue.answer,
            showing:null
        }));
        return{title:category.title,clues:clues};
    }catch (error){
        console.error('Error fetching category',error);
    }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
// mkaing and filling a table this way is inconvinient
async function fillTable() {
    var jeopardyContainer=$("<div calss='game-container'></div>")
    var JeopardyTable = $("<table id='jeopardy'><thead></thead><tbody></tbody></table>");
    jeopardyContainer.append(JeopardyTable)
    $('body').append(jeopardyContainer);
    let $thead = $('#jeopardy thead').empty();
    let $tbody = $('#jeopardy tbody').empty();
    let pickCat=_.sampleSize(categories, 6);
    let $tr=$('<tr>');
    for(let category of pickCat){
        $tr.append($('<th></th>').html(category.title));
    }$thead.append($tr);
    for(let clueIndx=0; clueIndx < 5; clueIndx++){
        let $tr=$('<tr>');
        for(let categoryIndx=0; categoryIndx < pickCat.length; categoryIndx++){
            let $td=$('<td>').text('?').attr('id', `${categoryIndx}-${clueIndx}`).css('cursor','pointer');
            $tr.append($td);
        }$tbody.append($tr);
    }
    categories=pickCat;
    // var i = 0;
    // var usedIDs = [];
    // do {
    //     var arIdNum = Math.floor((Math.random() * 10));
    //     //$.inArray returns -1 if not found
    //     if ($.inArray(arIdNum,usedIDs) < 0) {
    //         $tr.append($('<th></th>').html(categories[arIdNum].title));
    //         usedIDs.push(arIdNum);
    //         i++
    //     }
    // }
    // while (i < 6);
    // $thead.append($tr);
    // for(let clueIndx = 0; clueIndx < 5; clueIndx++){
    //     let $tr = $('<tr>');
    //     for(let categoryIndx = 0; categoryIndx < 6; categoryIndx++){
    //         $tr.append($('<td>').text('?').attr('id', `${categoryIndx}-${clueIndx}`));
    //     }
    //     $tbody.append($tr);
    // }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    console.log("handleClick function triggered")
    console.log("cell clicked:", evt.target)
    let $cell=$(evt.target);
    let id=$cell.attr('id');
    let [categoryIndx,clueIndx]=id.split('-');
    let clue=categories[categoryIndx].clues[clueIndx];
    console.log("Clue:",clue);
    if (!clue.showing){
        $cell.html(`
            <div>${clue.question}</div>
            <input type="text" id="answer-${id}" placeholder="What/Who is?">
            <button onclick="checkAnswer('${categoryIndx}','${clueIndx}','${id}')">Submit</button>`);
            clue.showing = "question";
    };
};

function checkAnswer(categoryIndx,clueIndx,cellId){
    let clue =categories[categoryIndx].clues[clueIndx];
    let userAnswer=$(`#answer-${cellId}`).val().toLowerCase();
    let correctAnswer=clue.answer.toLowerCase();
    let $cell=$(`#${cellId}`);
    if (userAnswer===correctAnswer){
        $cell.html(`Good Job! ${clue.answer}: was correct!`);
        $cell.css('background-color', 'green');
        let points=(parseInt(clueIndx)+1)*10;
        score+=points;
        alert(`Good Job ${points} earned points. Your score is :${score}. Keep up the good work!`);
    }else {
        $cell.html(`Nice Try! It should have been: ${clue.answer}`);
        $cell.css('background-color','red');
        alert(`Nice Try! Score Unchanged:${score}`);
    }
    clue.showing="answer";
};

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('#start-button').hide();
};

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#start-button').hide();
};

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    let gameTitle=$('<h1 id="gTitle">Jeopardy</h1>');
    $('body').append(gameTitle);
    $('#gTitle').css({
        'position': 'absolute',
        'top': '15px',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'text-align': 'center',
        'width': '100%',
    });
    let restB=$('<button id="reset" style="display:none;">Reset Game</button>');
    $('body').append(restB);
    restB.on('click',resetG)
    let categoryIds=await getCategoryIds(20);
    categories=[];
    for(let id of categoryIds){
        categories.push(await getCategory(id));
    }console.log(categories)
    await fillTable();
    hideLoadingView();
    $('#reset').show();
    // $('#start-button').hide();
}

function createStartB(){
    let startButton = $('<button id="start-button">Start Game</button>');
    $('body').append(startButton);
    startButton.on('click', function(){
        setupAndStart();
        $(this).hide();
    });
}
function resetG() {
    categories=[];
    score = 0;
    $('#gTitle').remove();
    $('#jeopardy').remove();
    $('#reset').hide();
    createStartB();
};
function styles(){
    const style=document.createElement('style');
    style.type='text/css';
    style.innerHTML=`
    .game-container{
        display:flex;
        justify content:center;
        box-sizing:border-box;
        max-width:80vh;
        max-height:80vh;
        overflow:auto;
        margin: 0px auto;
}
    #jeopardy{
        width: 100%;
        height:100%
        table-layout: fixed;
        box-sizing:border-box;
}
    #jeapardy th, #jeopardy td {
        border: 1px solid black;
        width: 15%;
        padding: 10px;
        text-align: center;
        font-size: 1.2em;
        color: white;
        box-sizing:border-box;
}
    #jeopardy th{
        background-color: teal;
}
    #jeopardy td{
        cursor: pointer;
}
    
    `;
    document.getElementsByTagName('head')[0].appendChild(style)
}
/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
// $(async function() {
//     $('#start-button').on('click',setupAndStart);
//     $('#jeopardy').on('click','td',handleClick);
// });

$(document).ready(function(){
    // call funcitons below on page load
    createStartB();
    styles();
    // setupAndStart();
    // $('#start-button').on('click',setupAndStart);
    $(document).on('click', '#jeopardy td', handleClick);
});