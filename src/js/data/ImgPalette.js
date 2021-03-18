export default class ImgPalette {
	constructor(srcImage) {
		this.srcImage = srcImage
		this.paletteColors = this.getPaletteColorsFromLocalStorage()

		if(!this.paletteColors){
			this.paletteColors = ['rgba(0,0,0,0)']
		}

		this.selectedColor = -1
	}

	getPaletteColorsFromLocalStorage() {
		return JSON.parse(localStorage.getItem(`"paletteColors ${this.srcImage}"`))
	}

	setPaletteColorsToLocalStorage() {
		localStorage.setItem(`"paletteColors ${this.srcImage}"`, JSON.stringify([...this.paletteColors]))
	}

	addPaletteColor(color) {
		this.paletteColors = [...this.paletteColors, color]
	}

	getPaletteColorByIndex(index) {
		return this.paletteColors[index]
	}

	getPaletteColorIndex(color) {
		return this.paletteColors.findIndex( val => val === color )
	}

	getAllPaletteColors() {
		return this.paletteColors
	}

	getSelectedColorIndex() {
		return this.selectedColor
	}

	getSelectedColor() {
		return this.paletteColors[this.selectedColor]
	}

	setSelectedColorByColorName(color) {
		this.selectedColor = this.getPaletteColorIndex(color)
	}

	setSelectedColor(index) {
		this.selectedColor = index
	}

	getLength() {
		return this.paletteColors.length
	}
}