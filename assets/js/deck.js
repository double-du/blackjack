let deck = '';

const spanDeck = document.querySelector('.house__deck_id');
const houseScoreboard = document.querySelector('.house__points_marker');
const playerScoreboard = document.querySelector('.player__points_counter');
const mainURL = 'https://deckofcardsapi.com/api/deck/';
const gameoverPanel = document.querySelector('.gameover');
let playerPoints = 0;
let housePoints = 0;
let mainButton = document.querySelector('.button_play');
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
        await buyCard('both',2);
        return;
    }

    if(deck != ''){
        if(cardsOfTheHouse() <= 5 && housePoints <= 17){
            await buyCard('both',2);
            return;
        }
        await buyCard('player',2);
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
            addCard('house', card.cards[0].value, card.cards[0].image);
            addCard('player', card.cards[1].value, card.cards[1].image);
            break;
        case 'player':
            addCard('player', card.cards[0].value, card.cards[0].image);
            break;
        case 'house':
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
    
    if(forWho === 'house'){
        housePoints += points;
        houseScoreboard.innerHTML = housePoints;
        checkScore();
        return;
    }
    if(forWho === 'player'){
        playerPoints += points;
        playerScoreboard.innerHTML = playerPoints;
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
    }
    if(housePoints > 21 || playerPoints == 21){
        gameoverPanel.classList.add('gameover--active');
        gameoverPanel.querySelector('.gameover__text').innerHTML = 'Parabéns! Você venceu!';
    }
}