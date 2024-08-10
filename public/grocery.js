import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import app from "./F7App.js";

const $$ = Dom7;

$$("#tab2").on("tab:show", () => {
    //put in firebase ref here
    const sUser = firebase.auth().currentUser.uid;
    firebase.database().ref("groceries/" + sUser).on("value", (snapshot) =>{
        $$("#plantList").html("");
        const oItems = snapshot.val();
        if (!oItems) {
            $$("#plantList").html("There is nothing, you can add a plant that you like.");
            return;
        }
        const aKeys = Object.keys(oItems);
        $$("#plantList").html("");
        for(let n = 0; n < aKeys.length; n++){
            let purchStyle = "";
            if (oItems[aKeys[n]].datePurchased) {
                purchStyle = "plant-purchased";
            }

            let sCard = 
            `<div class="card">
                <div class="card-content card-content-padding">
                    <img src="${oItems[aKeys[n]].imageUrl}" alt="a picture of plant" id="plant_image">
                </div>
                <div class="card-content card-content-padding ${purchStyle}">PlantName:${oItems[aKeys[n]].plantName}</div>
                <div class="card-content card-content-padding ${purchStyle}">PlantType:${oItems[aKeys[n]].plantType}</div>`;
            if (oItems[aKeys[n]].datePurchased) {
                sCard += `<div class="card-content card-content-padding">Purchased Day:${oItems[aKeys[n]].datePurchased}</div>`;
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
            $$("#plantList").append(sCard);
        }
    });
});

$$(".my-sheet").on("submit", e => {
    //submitting a new note
    e.preventDefault();
    const oData = app.form.convertToData("#addItem");
    const sUser = firebase.auth().currentUser.uid;
    const sId = new Date().toISOString().replace(".", "_");
    firebase.database().ref("groceries/" + sUser + "/" + sId).set(oData);
    app.sheet.close(".my-sheet", true);
});

$$("#plantList").on("click", ".button", function(e) {
    e.preventDefault();
    const sUser = firebase.auth().currentUser.uid;
    const action = $$(this).data("action");
    const itemId = $$(this).data("id");

    if (action === "bought") {
        firebase.database().ref("groceries/" + sUser + "/" + itemId).update({datePurchased: new Date().toISOString()});
    } else if (action === "neednot") {
        firebase.database().ref("groceries/" + sUser + "/" + itemId).remove();
        console.log("delete successfully");
    }
});