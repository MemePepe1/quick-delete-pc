const { Plugin } = require('powercord/entities');
const { findInReactTree } = require("powercord/util");
const { getModule, React, messages: { deleteMessage }, constants } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { can } = getModule(["can", "canEveryone"], false);
const { getUser, getCurrentUser } = getModule(["getCurrentUser"], false);
const { getChannel } = getModule(["getChannel"], false);
const { getSelectedChannelId } = getModule(["getSelectedChannelId"], false);
const { Permissions: {MANAGE_MESSAGES}} = constants;
const canDeleteMessage = d => (d.author.id == getCurrentUser().id || can(MANAGE_MESSAGES, getCurrentUser(), getChannel(getSelectedChannelId())));
// Discord React Bits
let Message;
// constant keycodes
const KEYCODES = { Backspace: 8 };
module.exports = class QuickDelete extends Plugin {

    async startPlugin() {
        console.log("started")
        Message = getModule(m => m?.default?.displayName === "Message", false);
        if (Message == null || Message == undefined)
        {
            console.log("message is note real :(");
        }
        inject("quick-delete", Message, 'default', (_, res) => {
            
            // console.log(res)
            res.props.children.props.oldOnCLick = res.props.children.props.onClick;
            res.props.children.props.onClick = ((e) => {((e, _this, res) => {
                console.log("Message.props.children.props.onClick called");
                (async () => {res.props.children.props.oldOnCLick(e); console.log("oldOnClick finished.")})()
                let d = findInReactTree(res, r => r?.message).message;
                console.log("message object retrieved");
                // let ce = findInReactTree(res.props.childrenButtons, r => r?.props?.hasOwnProperty("canDelete"))
                console.log(d);
                if (_this.keybindDown && e.button == 0 && canDeleteMessage(d)) {
                    console.log("dasdwetgwe");
                    _this.deleteMessage(findInReactTree(res, r => r?.message).props.message);
                }
            })(e, this, res)})
            return res;

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
        uninject("quick-delete")
    }
};
// {
//     let ce = findInReactTree(res.props.childrenButtons, r => r?.props?.hasOwnProperty("canDelete"))
//     console.log("CE=" + ce);
//     res.addEventListener("mousedown", e => {
//         setTimeout(() => {
//             if (this.keybindDown && this.clicking && ce.props.canDelete) {
//                 console.log("dasdwetgwe");
//                 this.deleteMessage(findInReactTree(res, r => r?.message).message);
//             }
//         }, 100)
//     })
// }
// findInReactTree(Message.props.childrenButtons, r => r?.hasOwnProperty("canDelete"))