import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import app from "./F7App.js";

const $$ = Dom7;

$$("#tab2").on("tab:show", () => {
    //put in firebase ref here
    const sUser = firebase.auth().currentUser.uid;
    firebase.database().ref("books/" + sUser).on("value", (snapshot) =>{
        $$("#bookList").html("");
        const oItems = snapshot.val();
        if (!oItems) {
            $$("#bookList").html("No books added yet. Start building your library.");
            return;
        }
        const aKeys = Object.keys(oItems);
        $$("#bookList").html("");
        for(let n = 0; n < aKeys.length; n++){
            let purchStyle = "";
            if (oItems[aKeys[n]].datePurchased) {
                purchStyle = "book-purchased";
            }

            let sCard = 
            `<div class="card">
                <div class="card-content card-content-padding">
                    <img src="${oItems[aKeys[n]].bookCoverUrl}" alt="Book Cover" id="book_cover">
                </div>
                <div class="card-content card-content-padding ${purchStyle}">${oItems[aKeys[n]].bookTitle}</div>
                <div class="card-content card-content-padding ${purchStyle}">Author: ${oItems[aKeys[n]].bookAuthor}</div>`;
            if (oItems[aKeys[n]].datePurchased) {
                sCard += `<div class="card-content card-content-padding">Purchased on: ${oItems[aKeys[n]].datePurchased}</div>`;
            }
            sCard += `
                <div class="row">
					<p class="segmented-raised" style="display: flex;justify-content: space-between;">`;
            if (!oItems[aKeys[n]].datePurchased) {
				sCard += `<a href="#" class="button button-outline" data-action="bought" data-id="${aKeys[n]}">I bought this</a>`;
            }
                sCard += `
						<a href="#" class="button button-outline" data-action="neednot" data-id="${aKeys[n]}">I don't need this</a>
					</p>
				</div>
            </div>
            `;
            $$("#bookList").append(sCard);
        }
    });
});

$$(".my-sheet").on("submit", e => {
    //submitting a new note
    e.preventDefault();
    const oData = app.form.convertToData("#addItem");
    const sUser = firebase.auth().currentUser.uid;
    const sId = new Date().toISOString().replace(".", "_");
    firebase.database().ref("books/" + sUser + "/" + sId).set(oData);
    app.sheet.close(".my-sheet", true);
});

$$("#bookList").on("click", ".button", function(e) {
    e.preventDefault();
    const sUser = firebase.auth().currentUser.uid;
    const action = $$(this).data("action");
    const itemId = $$(this).data("id");

    if (action === "bought") {
        firebase.database().ref("books/" + sUser + "/" + itemId).update({datePurchased: new Date().toISOString()});
    } else if (action === "neednot") {
        firebase.database().ref("books/" + sUser + "/" + itemId).remove();
        console.log("delete successfully");
    }
});
