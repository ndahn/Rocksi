/**
 * Inspired by https://codepen.io/takaneichinose/pen/eZoZxv
 */
class MessageBox {
	constructor(id, option, onClickCallback = null) {
		this.id = id;
		this.option = option;
	}

	show(msg, onCloseCallback = null) {
		if (this.id === null || typeof this.id === "undefined") {
			throw "Please set the 'ID' of the message box container.";
		}

		if (msg === "" || typeof msg === "undefined" || msg === null) {
			throw "The 'msg' parameter is empty.";
		}

		let option = this.option;

		let msgboxArea = document.querySelector(this.id);
		let msgboxBox = document.createElement("div");
		let msgboxContent = document.createElement("div");
		let msgboxText = document.createElement("div");
		let msgboxClose = document.createElement("a");

		if (msgboxArea === null) {
			throw "The Message Box container is not found.";
		}

		// Content area of the message box
		msgboxContent.classList.add("msgbox-content");
		msgboxText.classList.add("msgbox-text");
		msgboxText.innerText = msg;
		msgboxContent.appendChild(msgboxText);

		// Close button
		msgboxClose.classList.add("msgbox-close");
		msgboxClose.setAttribute("href", "#");
		msgboxClose.innerText = option.closeLabel || "CLOSE";

		// Container of the Message Box element
		msgboxBox.classList.add("msgbox-box");

		if (option.csscls) {
			for (let cls of option.csscls) {
				msgboxBox.classList.add(cls);
			}
		}

		if (option.closeOnClick) {
			msgboxBox.addEventListener("click", (evt) => {
				this.hide(msgboxBox);
			});
		}

		// TODO not working? Not important for now, but still strange
		msgboxBox.addEventListener("transitionend", () => {
			if (msgboxBox.classList.contains("msgbox-box-hide")) {
				msgboxBox.parentNode.removeChild(msgboxBox);
				clearTimeout(msgboxTimeout);

				if (onCloseCallback) {
					onCloseCallback();
				}
			}
		});

		msgboxBox.appendChild(msgboxContent);
		msgboxArea.appendChild(msgboxBox);

		// Close button
		if (option.hideCloseButton === false || typeof option.hideCloseButton === "undefined") {
			msgboxClose.addEventListener("click", (evt) => {
				evt.preventDefault();

				if (msgboxBox.classList.contains("msgbox-box-hide")) {
					// This is to avoid exceptions if the close button is clicked multiple times 
					// or clicked while hiding.
					return;
				}

				this.hide(msgboxBox);
			});

			msgboxBox.appendChild(msgboxClose);
		}

		// Auto closing
		let msgboxTimeout;
		if (option.closeTime > 0) {
			msgboxBox.addEventListener("mouseenter", (evt) => {
				clearTimeout(msgboxTimeout);
				msgboxTimeout = null;
			});

			msgboxBox.addEventListener("mouseleave", (evt) => {
				if (!msgboxTimeout) {
					msgboxTimeout = setTimeout(() => {
						this.hide(msgboxBox);
					}, option.closeTime);
				}
			});

			msgboxBox.dispatchEvent(new Event('mouseleave'));
		}
	}

	hide(msgboxBox) {
		msgboxBox.classList.add("msgbox-box-hide");
	}
}


let msgboxInfo = new MessageBox('#msgbox-area', {
	closeTime: 4000,
	hideCloseButton: true,
	closeOnClick: true,
	csscls: ["info"]
});

let msgboxWarning = new MessageBox('#msgbox-area', {
	closeTime: 4000,
	hideCloseButton: true,
	closeOnClick: true,
	csscls: ["warning"]
});

let msgboxError = new MessageBox('#msgbox-area', {
	closeTime: 6000,
	hideCloseButton: true,
	closeOnClick: true,
	csscls: ["error"]
});

let popInfo = (msg, cb) => msgboxInfo.show(msg, cb);
let popWarning = (msg, cb) => msgboxWarning.show(msg, cb);
let popError = (msg, cb) => msgboxError.show(msg, cb);

export { MessageBox, popInfo, popWarning, popError };
