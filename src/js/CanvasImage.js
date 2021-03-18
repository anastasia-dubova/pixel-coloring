import * as PIXI from 'pixi.js'
import ImgData from './data/ImgData'
import ImgPalette from './data/ImgPalette'
import { medianCut } from './medianCut'

import * as constant from './constants'

export default class CanvasImage {
	
	constructor(app, srcImage) {

		this.app = app
		this.canvas = document.createElement('canvas')

		this.context = this.canvas.getContext('2d')
		this.cnvCnt = document.querySelector(constant.CANVAS_SELECTOR)
		this.canvasCounter = document.querySelector(constant.COUNTER)

		const newImage = new Image()
		newImage.src = srcImage

		newImage.onload = () => {
			this.dataArray = new ImgData(srcImage)
			this.palette = new ImgPalette(srcImage)

			//let imgSizeKoef = constant.FIELD_SIZE / Math.max(newImage.width, newImage.height)
			let imgSizeKoef = this.dataArray.getDataFieldSize() / Math.max(newImage.width, newImage.height)

			newImage.width *= imgSizeKoef
			newImage.height *= imgSizeKoef

			this.canvas.width = newImage.width
			this.canvas.height = newImage.height
			
			this.context.drawImage(newImage, 0, 0, this.canvas.width, this.canvas.height)
			this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)

			let container = new PIXI.Container()
			this.app.stage.addChild(container)

			if(this.dataArray.getDataLength() === 0) {
				this.transform(medianCut)
			}

			this.fillPixel(container)

			this.fillPalette()

			this.app.view.interactiveMouseWeel = true

			this.app.view.addEventListener('mousewheel', this.mouseWheelEvent.bind(this))
			this.app.view.addEventListener('wheel', this.mouseWheelEvent.bind(this))

			this.app.view.addEventListener('contextmenu', e => {
				e.preventDefault()
			})
			this.app.view.addEventListener('mousedown', e => {
				if(!((e.which === 3) || (e.which === 1 && e.buttons === 2))) return

				this.isDown = true
				this.currentXPos = e.clientX
				this.currentYPos = e.clientY
			})
			this.app.view.addEventListener('mousemove', e => {
				if(!((e.which === 3) || (e.which === 1 && e.buttons === 2))) return

				this.cnvCnt.scrollTop += this.currentYPos - e.clientY
				this.cnvCnt.scrollLeft += this.currentXPos - e.clientX
			})
			this.app.view.addEventListener('mouseup', e => {
				if(!((e.which === 3) || (e.which === 1 && e.buttons === 2))) return

				this.isDown = false
			})

			this.scaleImage(.25)
			this.canvasCounter.textContent = this.dataArray.getGameCount()
		}
	}
	mouseWheelEvent(e) {
		e.preventDefault()
		this.scaleImage(e)
	}

	scaleImage(koef) {
		if(typeof koef === 'number') {
			this.app.stage.scale.set(koef)
		} else {
			let newScale = this.app.stage.scale._y
			if(koef.deltaY > 0 ) {
				newScale *= 1.5
				newScale = newScale > 1 ? 1 : newScale
				this.app.stage.scale.set(newScale)
			} else {
				newScale /= 1.5
				newScale = newScale < .05 ? .05 : newScale
				this.app.stage.scale.set(newScale)
			}
		}
		this.app.renderer.resize(this.app.stage.width, this.app.stage.height);
	}
	
	transform(fn) {
		const colorsArray = fn(this.imageData.data, constant.COLORS_COUNT)

		colorsArray.forEach( (value, index) => {
			const rgbaColor = `rgba(${value.rgbaColor.r},${value.rgbaColor.g},${value.rgbaColor.b},1)`
			//const hexColor = (1 << 24) + (parseInt(value.rgbaColor.r) << 16) + (parseInt(value.rgbaColor.g) << 8) + parseInt(value.rgbaColor.b)

			this.palette.addPaletteColor(rgbaColor)
			let colorNumber = this.palette.getLength() - 1

			value.data.forEach( item => {
				this.dataArray.addDataItem(item.srcIndex, {
					color: colorNumber
					//,selectedColor: -1,
				})
			})
		})
		this.palette.setPaletteColorsToLocalStorage()
		this.dataArray.setDataToLocalStorage()
	}

	fillPalette() {
		const paletteContainer = document.querySelector(constant.PALETTE_CONTAINER_SELECTOR)
		this.palette.getAllPaletteColors().forEach((value, index) => {
			
			const colorItem = document.createElement('div')
			colorItem.classList.add(constant.PALETTE_ITEM_CLASS)
			colorItem.style.backgroundColor = value
			if(index > 0) {
				const colorText = document.createElement('p')
				colorText.textContent = index
				if(value === 'rgba(0,0,0,255)') colorText.style.color = '#ffffff'
				colorItem.appendChild(colorText)
			} else {
				colorItem.classList.add(constant.PALETTE_ITEM_ERASER)
				colorItem.classList.add(constant.PALETTE_ITEM_SELECTED)
			}
			
			colorItem.addEventListener('click', this.selectPaletteColor.bind(this, colorItem, value, index))
			paletteContainer.appendChild(colorItem)
		})
		
	}

	selectPaletteColor(self, value, index, e) {
		document.querySelectorAll(`.${constant.PALETTE_ITEM_SELECTED}`).forEach(el => 
			el.classList.remove(constant.PALETTE_ITEM_SELECTED))
			self.classList.add(constant.PALETTE_ITEM_SELECTED)

			this.palette.setSelectedColor(index)
	}

	fillPixel(parent) {

		let i = 0
		let j = 0

		let fragment = new PIXI.Graphics();

		for(let k = 0; k < this.dataArray.getDataLength(); k++) {
			let cell = new PIXI.Graphics();
			cell.beginFill(this.rgbaToHex(this.palette.getPaletteColorByIndex(this.dataArray.getDataItem(k).selectedColor)) || 0xCCCCCC)

			cell.lineStyle(1, 0xA5A5A5)

			cell.drawRect(0, 0, constant.CELL_SIZE, constant.CELL_SIZE)
			cell.endFill()

			cell.x = i * constant.CELL_SIZE
			cell.y = j * constant.CELL_SIZE

			i++
			if (i == this.canvas.width) {
				i = 0
				j++
			}

			cell.interactive = true
			
			cell//.on('click', this.colorCell.bind(this, k))
				 .on('mousedown', this.colorCell.bind(this, k))
				 .on('mouseover', this.colorCellContinue.bind(this, k))

			if(!this.dataArray.isCompleted(k)) {
				let cellText = new PIXI.Text(this.dataArray.getDataItem(k).color, {
					fontFamily: 'Arial',
					fontSize: 36,
					fontWeight: 700, // bold
					fill: 'black'
				})
				cellText.anchor.x = cellText.anchor.y = .5
				cellText.x = cellText.y = constant.CELL_SIZE/2

				cell.addChild(cellText)
			}
			fragment.addChild(cell)
			//parent.addChild(cell)
		}
		parent.addChild(fragment)
	}

	colorCell(index, e) {

		if(this.dataArray.isCompleted(index)) return

		const rgba = this.palette.getSelectedColor().replace(/^rgba?\(|\s+|\)$/g, '').split(',');
		const hex = (1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])

		let newValue = {color: this.dataArray.getDataItem(index).color}
		if(rgba[3] != 0) {
			newValue = {...newValue, selectedColor: this.palette.getSelectedColorIndex()}
		}

		this.dataArray.setDataItem(index, newValue)

		if(rgba[3] == 0) {
			e.target.beginFill(constant.DEFAULT_CELL_COLOR, 1)
		} else {
			e.target.beginFill(hex, rgba[3])
		}

		e.target.drawRect(0, 0, constant.CELL_SIZE, constant.CELL_SIZE)

		if(this.dataArray.isCompleted(index)) {
			for(let i = e.target.children.length; i>=0; i--) {
				e.target.removeChild(e.target.children[i])
			}
		}

		this.canvasCounter.textContent = this.dataArray.getGameCount()
		if(this.dataArray.isWin()) alert('WIN!!!!')
	}

	colorCellContinue(index, e) {
		if(e.data.buttons !== 1) return

		this.colorCell(index, e)
	}

	rgbaToHex(color) {
		if(!color) return null

		const rgba =color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');

		return (1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])
	}

}