/*
 * Clean Reply
 */

'use strict';

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

const sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);



let myStylesheets = [
    "chrome://clean-reply/skin/clean-reply.css",
];

function dumpObj(aTitle, aObj)
{
    dump("=== "+aTitle+": "+aObj+" ===\n");
    for(let i in aObj)
    {
        dump("- "+i+" -> "+aObj[i]+"\n")
    }
    dump("=== done ===\n")
}

/*
 * =startup=
 * Function used by Mozilla to initialize restartless addons
 */
function startup(data, reason)
{
    // Register my stylesheets
    myStylesheets.forEach(function(x) {
        let uri = Services.io.newURI(x, null, null);
        sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
    });

    gCleanReplyWindowListener.register();
} // function startup()

/*
 * =shutdown=
 * Function used by Mozilla to disable restartless addons
 */
function shutdown(data, reason)
{

    // Unegister my stylesheets
    myStylesheets.forEach(function(x) {
        let uri = Services.io.newURI(x, null, null);
        if (sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
            sss.unregisterSheet(uri, sss.AUTHOR_SHEET);
        }
    });

    gCleanReplyWindowListener.unregister();
} // function shutdown()

/*
 * I don't really use these
 */
function install(aData, aReason) { }
function uninstall(aData, aReason) { }

/*
 *
 *
 */
var gCleanReplyWindowListener = {
    onOpenWindow: function(aXULWindow) {
        dumpObj("onOpenWindow",aXULWindow)
    },

    onCloseWindow: function(aXULWindow) {
        dumpObj("onCloseWindow",aXULWindow)
    },

    onWindowTitleChange: function(aXULWindow, aNewTitle) {},

    register: function() {
        Services.wm.addListener(gCleanReplyWindowListener);
    },

    unregister: function() {
        Services.wm.removeListener(gCleanReplyWindowListener);
    },

    loadIntoWindow: function(aDOMWindow) {
    },

    unloadFromWindow: function(aDOMWindow, aXULWindow) {
    },
}; // var gCleanReplyWindowListener

/*
 * =ClipboardSaver=
 * Some of the selection manipulation we do can destroy
 * the X11 selection clipboard.  This saves and restores it.
 */

function auwrClipboardSaver() {
    this.dataStack = new Array();
    this.clipBoard = Cc["@mozilla.org/widget/clipboard;1"]
        .getService(Ci.nsIClipboard);
    this.needed = this.clipBoard.supportsSelectionClipboard();
}

auwrClipboardSaver.prototype = {
    save: function()
    {
        if( !this.needed ) return;
        try
        {
            var transferable = Cc["@mozilla.org/widget/transferable;1"]
                .createInstance(Ci.nsITransferable);
            transferable.addDataFlavor("text/unicode");
            this.clipBoard.getData(transferable, this.clipBoard.kSelectionClipboard);
            var flavour = {};
            var data = {};
            var length = {};
            transferable.getAnyTransferData(flavour, data, length);
            this.dataStack.push(data);
        }
        catch(ex) { }
    },
    restore: function()
    {
        if( !this.needed ) return;
        try
        {
            var data = this.dataStack.pop();
            var pasteClipboard = Cc["@mozilla.org/widget/clipboardhelper;1"]
                .getService(Ci.nsIClipboardHelper);
            data = data.value.QueryInterface(Ci.nsISupportsString).data;
            pasteClipboard.copyStringToClipboard(data, this.clipBoard.kSelectionClipboard);
        }
        catch(ex) { }
    }
};


/*
 * Editor modelines  -  https://www.wireshark.org/tools/modelines.html
 *
 * Local variables:
 * mode: javascript
 * c-basic-offset: 4
 * tab-width: 4
 * indent-tabs-mode: nil
 * coding: utf8
 * End:
 *
 * vi: set shiftwidth=4 tabstop=4 expandtab filetype=javascript fileencoding=utf8:
 * :indentSize=4:tabSize=4:noTabs=true::coding=utf8:mode=javascript:
 */
