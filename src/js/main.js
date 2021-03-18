import GameField from './GameField'
import CanvasImage from './CanvasImage'

import '../css/main.scss'

import { MODAL_SELECTOR } from './constants'

const modalWindow = document.querySelector(MODAL_SELECTOR)

var selectedImage

let imgArray = ['img/01.jpg', 'img/02.png', 'img/03.jpg', 'img/04.jpg', 'img/05.png']
imgArray.forEach( value => {
	let img = document.createElement('div')
	img.setAttribute('data-value', value)
	img.style.backgroundImage = `url(${value})`
	img.addEventListener('dblclick', selectImage)
	modalWindow.appendChild(img)
} )

function selectImage(e) {
	selectedImage = e.target.getAttribute('data-value')
	modalWindow.parentElement.classList.add('hidden')

	const game = new GameField()
	const canvasGame = new CanvasImage(game.getApp(), selectedImage)
}


