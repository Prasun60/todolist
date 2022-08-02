//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prasun:abcd@cluster0.smcotka.mongodb.net/?retryWrites=true&w=majority");
const itemsschema = new mongoose.Schema({
  name: String
})
const item = mongoose.model("item", itemsschema);
const item1 = new item({
  name: "welcome to your tododlist!"
})

const item2 = new item({
  name: "hit the + button to add a new item"
})
const item3 = new item({
  name: "<-- Hit this to delete an item"
})
const defaultitems = [item1, item2, item3];

const listscehma = {
  name: String,
  items: [itemsschema]
}

const List = mongoose.model("List", listscehma);



app.get("/", function (req, res) {

  const day = date.getDate();
  item.find(function (err, founditems) {
    if (err) {
      console.log(err);
    } else if (founditems.length == 0) {
      item.insertMany(defaultitems, function (err1) {
        if (err1) {
          console.log(err1);
        } else {
          console.log("inserted");
        }
      })
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: founditems });
    }
  })
});

app.post("/", function (req, res) {
  const a = req.body.list;
  // console.log(a);
  const b = date.getDate();
  // console.log(b);
  const itemname = req.body.newItem;

  const Item = new item({
    name: itemname
  })

  if (a == b) {
    Item.save();
    res.redirect("/")
  } else {
    List.findOne({name:a},function(err,foundlist){
      foundlist.items.push(Item);
      foundlist.save();
      res.redirect("/"+a);
    })
  }
});

app.post("/delete", function (req, res) {
  const id1 = req.body.checkbox;
  const liname=req.body.listname;
  if(liname==date.getDate()){
    item.findByIdAndRemove(id1, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted");
        res.redirect("/");
      } 
    })
  }else{
    List.findOneAndUpdate({name:liname},{$pull:{items:{_id:id1}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+liname);
      }
    })
  } 
})

app.get("/:topic", function (req, res) {
  const lname = _.capitalize(req.params.topic);
  List.findOne({ name: lname }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: lname,
          items: defaultitems
        })
        list.save();
        res.redirect("/" + lname);
      } else {
        res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
      }
    }
  })



})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
