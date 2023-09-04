let deck = '';

const spanDeck = document.querySelector('.house__deck_id');
const houseScoreboard = document.querySelector('.house__points_marker');
const playerScoreboard = document.querySelector('.player__points_counter');
const mainURL = 'https://deckofcardsapi.com/api/deck/';
const gameoverPanel = document.querySelector('.gameover');
const mainButton = document.querySelector('.button_play');
const recomecar = document.querySelector('.house__deck_change');
let playerPoints = 0;
let housePoints = 0;
let gameOn = false;

mainButton.addEventListener('click', async (e) => {
    e.preventDefault();
    if(deck === ''){
        deck = await getDeck();
        if(deck === 'error'){
            alert ("Ops... algo deu errado ao obter um novo baralho");
            return;
        }
        await startsGame();
        mainButton.innerHTML = 'Comprar Carta';
        await buyCard('both', 2);
        recomecar.classList.remove('house__deck_change--disabled');
        return;
    }

    if(deck != ''){
        if(cardsOfTheHouse() <= 5 && housePoints <= 17){
            await buyCard('both', 2);
            return;
        }
        await buyCard('player',1);
        return;
    }
    
});

async function getDeck()
{
    let actionURL = 'new/shuffle/?deck_count=1';
    const url = mainURL + actionURL;
    const resp = await fetch(url);
    const json = await resp.json();
    if(json.success){
        return json.deck_id
    }
    return 'error'
}

async function startsGame()
{
    spanDeck.innerHTML = deck
    houseScoreboard.innerHTML = housePoints;
    playerScoreboard.innerHTML = playerPoints;
    gameOn = true;
    return;
}

async function getACard (howMuch) {
    let actionURL = deck + `/draw/?count=${howMuch}`;
    const url = mainURL + actionURL;
    const json = await fetch(url)
                        .then(response => response.json());
    return json;
}

async function buyCard(forWho, howMuch) {
    let card = await getACard(howMuch);
    if(!card.success){
        alert('Ops, algo deu errado ao comprar uma carta.');
        return
    }
    
    switch (forWho){
        case 'both':
            if(gameOn)
                addCard('player', card.cards[1].value, card.cards[1].image);
            if(gameOn)
                addCard('house', card.cards[0].value, card.cards[0].image);
            break;
        case 'player':
            if(gameOn)
                addCard('player', card.cards[0].value, card.cards[0].image);
            break;
        case 'house':
            if(gameOn)
                addCard('house', card.cards[0].value, card.cards[0].image);
            break;
    }
}

async function addCard(forWho, card, cardImage) {
    let hand = document.querySelector(`.${forWho}__hand`);
    let cardElement = document.createElement('span');
    cardElement.classList.add('card');
    cardElement.style.backgroundImage = `url(${cardImage})`;
    await updatePoints(forWho, card);
    hand.appendChild(cardElement);
    checkScore();
}

async function updatePoints(forWho, card){
    switch (card){
        case 'JACK':
        case 'KING':
        case 'QUEEN':
            points = 10;
            break;
        case 'ACE':
            points = 1;
            break;
        default:
            points = parseInt(card);
            break;
    }
    
    if(forWho === 'player'){
        playerPoints += points;
        playerScoreboard.innerHTML = playerPoints;
        checkScore();
        return;
    }

    if(forWho === 'house'){
        housePoints += points;
        houseScoreboard.innerHTML = housePoints;
        checkScore();
        return;
    }
}

function cardsOfTheHouse(){
    let totalCards = document.querySelectorAll('.house__hand .card')
    return totalCards.length;
}

function checkScore(){
    if(playerPoints > 21){
        gameoverPanel.classList.add('gameover--active');
        gameoverPanel.querySelector('.gameover__text').innerHTML = 'A Casa ganhou...';
        gameOn = false;
    }
    if(housePoints > 21 || playerPoints == 21){
        gameoverPanel.classList.add('gameover--active');
        gameoverPanel.querySelector('.gameover__text').innerHTML = 'Parabéns! Você venceu!';
        gameOn = false;
    }
}

function countPoints() {
    if(playerPoints > housePoints){
        gameoverPanel.classList.add('gameover--active');
        gameoverPanel.querySelector('.gameover__text').innerHTML = 'Parabéns! Você venceu!';
    }
    if(playerPoints < housePoints){
        gameoverPanel.classList.add('gameover--active');
        gameoverPanel.querySelector('.gameover__text').innerHTML = 'A Casa ganhou...';
    }
}

function restartGame(){
    deck = '';
    playerPoints = 0;
    housePoints = 0;
    gameOn = false;
    gameoverPanel.classList.remove('gameover--active');
    spanDeck.innerHTML = '';
    gameoverPanel.querySelector('.gameover__text').innerHTML = '';
    houseScoreboard.innerHTML = housePoints;
    playerScoreboard.innerHTML = playerPoints;
    mainButton.innerHTML = 'Iniciar';
    recomecar.classList.add('house__deck_change--disabled');
    document.querySelector('.player__hand').innerHTML = '';
    document.querySelector('.house__hand').innerHTML = '';
}

document.querySelector('.house__deck_change').addEventListener('click', () => {
    restartGame();
});

document.querySelector('.gameover__reset').addEventListener('click', () => {
    restartGame();
});

document.querySelector('.stop_game').addEventListener('click', () => {
    countPoints();
});