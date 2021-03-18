import { FIELD_SIZE } from '../constants'

export default class ImgData {
	constructor(srcImage) {
		this.srcImage = srcImage

		let tmpData = this.getDataFromLocalStorage()
		this.data = tmpData ? tmpData.data : []
		this.fieldSize = tmpData ? tmpData.fieldSize : FIELD_SIZE

	}

	addDataItem(index, data) {
		this.data[index] = data
	}

	getDataLength() {
		return this.data.length
	}

	getDataFieldSize() {
		return this.fieldSize
	}

	getDataItem(index) {
		return this.data[index]
	}

	setDataItem(index, data) {
		this.data[index] = data
		this.setDataToLocalStorage()
	}

	setDataToLocalStorage(){
		localStorage.setItem(`"data ${this.srcImage}"`, JSON.stringify({data: this.data, fieldSize: this.fieldSize}))
	}
	getDataFromLocalStorage() {
		return JSON.parse(localStorage.getItem(`"data ${this.srcImage}"`))
	}

	isCompleted(index) {
		return this.data[index].selectedColor && this.data[index].color === this.data[index].selectedColor
	}

	isWrong(index) {
		return this.data[index].selectedColor && this.data[index].color !== this.data[index].selectedColor
	}

	isWin() {
		return this.data.filter( value => value.selectedColor !== value.rgbaColor).length === 0
	}

	getGameCount() {
		let str = `RIGHT: ${this.data.filter( value => value.selectedColor && value.selectedColor === value.color).length}, 
			WRONG: ${this.data.filter( value => value.selectedColor && value.selectedColor !== value.color).length}, 
			ALL: ${this.getDataLength()}`
		return str
	}
}