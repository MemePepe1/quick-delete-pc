const { Plugin } = require('powercord/entities');
const { findInReactTree } = require("powercord/util");
const { getModule, React, messages: {deleteMessage} } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
// Discord React Bits
let Message;
// constant keycodes
const KEYCODES = {Backspace:8};
module.exports = class QuickDelete extends Plugin {
    
    async startPlugin() {
        Message = await getModule(m => m?.default?.displayName === "Message");
        this.inject();
        document.body.addEventListener("keydown", (e) => {if (e.keyCode == KEYCODES.Backspace) {this.keybindDown = true;}})
        document.body.addEventListener("keyup", (e) => {if (e.keyCode == KEYCODES.Backspace) {this.keybindDown = false;}})
        document.body.addEventListener("mousedown", (e) => {if (e.button == 0) {this.mouseDown = true;}})
        document.body.addEventListener("mouseup", (e) => {if (e.button == 0) {this.mouseDown = false;}})
        
    }
    inject()
    {
        inject("QuickDelete", Message, (_, res) => {
            let ce = findInReactTree(res.props.childrenButtons, r => r?.props?.hasOwnProperty("canDelete"))
            if (this.keybindDown && this.clicking && ce.props.canDelete)
            {
                this.deleteMessage(findInReactTree(res, r => r?.message).message);
            }
        })
    }
    deleteMessage(mesg){
        deleteMessage(mesg.channel_id, mesg.id)
    }

    pluginWillUnload() {
        uninject("QuickDelete")
    }
};
// findInReactTree(Message.props.childrenButtons, r => r?.hasOwnProperty("canDelete"))