const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
main().catch(err=> console.log(err));

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1/todolistDB");
    console.log("connected");

    const itemsSchema = new mongoose.Schema({
        name: String
    });

    const Item = mongoose.model("Item", itemsSchema);

    const item1 = new Item({
        name: "welcome to your todolist!"
    });

    const item2 = new Item({
        name: "hit the + button!"
    });

    const item3 = new Item({
        name: "hit it"
    });

    const defaultItems = [item1,item2,item3];

    const listSchema = {
        name: String,
        items: [itemsSchema]
    };


    const List = mongoose.model("List", listSchema);
  

    app.get("/", function(request, response){

      List.findOne({name:"Today"})
      .then(function(foundList){
       if(foundList===null){
           const list = new List({
               name: "Today",
               items: defaultItems
              });
   
              list.save();
              response.redirect("/");
           
           
           } else{
               response.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
           }
     });
        });

     

        app.get("/:customListName", function(request,response){
           const customListName = _.capitalize(request.params.customListName);

           List.findOne({name:customListName})
           .then(function(foundList){
            if(foundList===null){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                   });
        
                   list.save();
                   response.redirect("/"+ customListName);
                
                
                } else{
                    response.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
                }
            
             });

            




        });

            

          


        app.post("/" , function(request,response){
            let itemName = request.body.newItem;
            let listName= request.body.list;
            const item = new Item({
                name: itemName
            });

                List.findOne({name: listName})
                .then(function(foundList){
                    foundList.items.push(item);
                    foundList.save();
                    if(listName === "Today"){
                      response.redirect("/");
                    }
                    else{
                      response.redirect("/" + listName);
                    }
                   
                });
            
        
           
            
            
        
        }); 
          
        app.post('/delete', async (req, res) => {

            const checkedItemId = req.body.checkbox;
            const listName = req.body.listName;
             
                List.findOne({ name: listName })
                  .then((foundList) => {
                    if (foundList) {
                      foundList.items.pull({ _id: checkedItemId });
                      return foundList.save();
                    }
                  })
                  .then(() => {
                    console.log("We have removed the item with id: " + checkedItemId + " from " + listName + " list");

                    if(listName === "Today"){
                      res.redirect("/");
                    }
                    else{
                      res.redirect("/" + listName);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              
            
            });




          }




app.listen(3000, function(){
    console.log("server started on port 3000");
});