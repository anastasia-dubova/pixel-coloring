export function medianCut(data, colorsCount) {
	if(data.length <= colorsCount*4) return data

	const transformedData = getTransformedArray(data)

	let boxes = [{data: transformedData, maxRange: findLargestComponent(transformedData)}]

	medianCutFunction(boxes, colorsCount)

	boxes.forEach( value => {
		setAverageColor(value)
	})
	//return createNewImage(boxes)
	return boxes
}

function getTransformedArray(data) {
	
	const colors = []
	let k = 0
	for(let i = 0; i < data.length; i += 4) {
		colors[k] = {
			srcRgbaColor : {
				r: data[i],
				g: data[i + 1],
				b: data[i + 2],
				a: data[i + 3]
			},
			srcIndex: k
		}
		k++
	}
	return colors
}

function medianCutFunction(arr, colorsCount) {
	if (arr.length >= colorsCount) return

	let indexMaxRange = arr.reduce( (maxRange, value, index) => {
		return value.maxRange.range > maxRange.range ? {index, range: value.maxRange.range, component: value.maxRange.component} : maxRange
	}, {index: -1, range: -1, component: ''})

	arr.splice(indexMaxRange.index, 1, ...cut(arr[indexMaxRange.index]))

	medianCutFunction(arr, colorsCount)

}

function cut(arr) {

	var a = new Array()
	var b = new Array()

	let component = arr.maxRange.component
	const medianColorIndex = arr.data
		.sort( (a, b) => a.srcRgbaColor[component] - b.srcRgbaColor[component])
		.findIndex( (element, index, array) => {
			return element.srcRgbaColor[component] >= array[0].srcRgbaColor[component] + arr.maxRange.range/ 2
		})

	b = arr.data.splice(medianColorIndex, arr.data.length)
	a = arr.data.splice(0, arr.data.length)

	const returnArray = [{data: a, maxRange: findLargestComponent(a)}, {data: b, maxRange: findLargestComponent(b)}]
	return returnArray
}

function findLargestComponent(arr) {
	const componentRangeArray = [findComponentRange(arr,'r'), findComponentRange(arr,'g'), findComponentRange(arr,'b')]

	let range = componentRangeArray.reduce( (maxRange, value) => {
		return value.range > maxRange.range ? value : maxRange
	}, {component: '', range: -1})

	return range
}

function findComponentRange(arr, component) {
	let max = arr.reduce( (maxValue, currentValue, index) => {
		return currentValue.srcRgbaColor[component] > maxValue ? currentValue.srcRgbaColor[component] : maxValue
	}, -1)

	let min = arr.reduce( (minValue, currentValue, index) => {
		return currentValue.srcRgbaColor[component] < minValue ? currentValue.srcRgbaColor[component] : minValue
	}, 257)

	return {component, range: max - min}
}

function setAverageColor(arr) {
	arr.rgbaColor = {
		r: +(findAverageColorByComponent(arr.data, 'r') / arr.data.length).toFixed(),
		g: +(findAverageColorByComponent(arr.data, 'g') / arr.data.length).toFixed(),
		b: +(findAverageColorByComponent(arr.data, 'b') / arr.data.length).toFixed()
	}
}

function findAverageColorByComponent(arr, component) {
	let sum = arr.reduce( (sum, currentValue, index) => {
		return sum + currentValue.srcRgbaColor[component]
	}, 0)

	return sum
}

function createNewImage(arr){
	arr.forEach( value => {
		setAverageColor(value.data)
	})
	let newImage = new Array(arr.length*4)

	for(let value of arr) {
		for(let vl of value.data) {
			let index = vl.srcIndex*4
			if(vl.srcRgbaColor.a > 0) {
				newImage[index] = vl.rgbaColor.r
				newImage[index+1] = vl.rgbaColor.g
				newImage[index+2] = vl.rgbaColor.b
				newImage[index+3] = 1
			} else {
				newImage[index] = 255
				newImage[index+1] = 255
				newImage[index+2] = 255
				newImage[index+3] = 1
			}
		}
	}
	return newImage
}