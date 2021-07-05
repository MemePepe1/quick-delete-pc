const { Plugin } = require('powercord/entities');
const { findInReactTree } = require("powercord/util");
const { getModule, React, messages: { deleteMessage } } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
// Discord React Bits
let Message;
// constant keycodes
const KEYCODES = { Backspace: 8 };
module.exports = class QuickDelete extends Plugin {

    async startPlugin() {
        console.log("started")
        Message = getModule(m => m?.default?.displayName === "Message", false);
        inject("QuickDelete", Message, (_, res) => {
            
            React.createElement("div",
                {
                    className: ".quick-delete",
                    onClick: (() => {
                        let ce = findInReactTree(this.props.res.props.childrenButtons, r => r?.props?.hasOwnProperty("canDelete"))
                        console.log("CE=" + ce);
                        if (this.props._this.keybindDown && this.props._this.clicking && ce.props.canDelete) {
                            console.log("dasdwetgwe");
                            this.props._this.deleteMessage(findInReactTree(this.props.res, r => r?.message).message);
                        }
                    }),
                    _this: this,
                    res: res
                });
        })


        document.body.addEventListener("keydown", (e) => { if (e.keyCode == KEYCODES.Backspace) { this.keybindDown = true; } })
        document.body.addEventListener("keyup", (e) => { if (e.keyCode == KEYCODES.Backspace) { this.keybindDown = false; } })
        document.body.addEventListener("mousedown", (e) => { if (e.button == 0) { this.mouseDown = true; } })
        document.body.addEventListener("mouseup", (e) => { if (e.button == 0) { this.mouseDown = false; } })

    }
    deleteMessage(mesg) {
        deleteMessage(mesg.channel_id, mesg.id)
    }

    pluginWillUnload() {
        uninject("QuickDelete")
    }
};
{
    let ce = findInReactTree(res.props.childrenButtons, r => r?.props?.hasOwnProperty("canDelete"))
    console.log("CE=" + ce);
    res.addEventListener("mousedown", e => {
        setTimeout(() => {
            if (this.keybindDown && this.clicking && ce.props.canDelete) {
                console.log("dasdwetgwe");
                this.deleteMessage(findInReactTree(res, r => r?.message).message);
            }
        }, 100)
    })
}
// findInReactTree(Message.props.childrenButtons, r => r?.hasOwnProperty("canDelete"))