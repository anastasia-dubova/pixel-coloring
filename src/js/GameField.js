import * as PIXI from 'pixi.js'

import { APP_SELECTOR, CELL_SIZE, FIELD_SIZE } from './constants'

export default class GameField {
	constructor() {
		const width = FIELD_SIZE * CELL_SIZE
		
		this.pixi_app = new PIXI.Application({width, width});

		let app = document.querySelector(APP_SELECTOR)
		if (!app) return

		app.appendChild(this.pixi_app.view);

		this.pixi_app.renderer.view.style.display = "block";
		this.pixi_app.renderer.autoDensity = true;
		this.pixi_app.renderer.resize(window.innerWidth, window.innerHeight);
	}

	getApp() {
		return this.pixi_app
	}
}