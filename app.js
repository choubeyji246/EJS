const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
// const date=require(__dirname+"/date.js");
const _=require("lodash");

const app = express();


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// var items=["Buy food","cook food","Eat food"];
// var workItems=[];


const uri="mongodb+srv://ankit:kRdvKJhWd2qsQ0GE@cluster0.3sackxo.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri,{dbName:"todolistDB"},function(){
    console.log("Sucessfully connected to database");
});

const itemSchema={
   title: String,
}
const Item=mongoose.model("Item",itemSchema);

const item1= new Item({
  title:"Welcome to Todo list",

})
const item2= new Item({
  title:"Click + button to add items",

})
const item3= new Item({
  title:"<-- Hit this to delete an item",

})

const defaultArray=[item1,item2,item3]

const listSchema={
  title: String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);



app.get("/", function (req, res) {

  // let day=date()



Item.find({},function(err,foundItems){

if(foundItems.length==0){
  Item.insertMany(defaultArray,function(err){
    if(!err){
      console.log("Sucessfully inserted default data");
    }
  })
}else{
  res.render("list", { newTitle:"Today" , newListItem:foundItems});
}
}
)
});


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({title:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          title:customListName,
          items:defaultArray
        })
        list.save();
        res.redirect("/"+ customListName);
      }else{
        res.render("list", { newTitle:foundList.title , newListItem:foundList.items})
      }
    }
 
  })
  
});


app.post("/",function(req,res){
    
  const itemName=req.body.newItem;
  const listName=req.body.list;
  // console.log(req.body.list);
  
  const item= new Item({
    title:itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({title:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }
})
app.post("/delete",function(req,res){
  const checkedItem=req.body.checkBox;
  const listName=req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItem,function(err){
    console.log("Item Deleted sucessfully");
    res.redirect("/");
  });
}else{
  List.findOneAndUpdate({title:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  })
}



//  console.log(req.body.checkBox); 
})
// app.get("/work",function(req,res){
//   res.render("list", { newTitle:"Work List", newListItem:workItems});
// })




app.listen(3000, function () {
  console.log("server starred at port 3000");
});
