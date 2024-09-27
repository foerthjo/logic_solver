import { Implication, Item, Relation, RelationInstance } from "./solver";

let item = new Item("item");
let blue = new Item("blue");
let red = new Item("red");
let cube = new Item("cube");
let sphere = new Item("sphere");

let is = new Relation("is", "is not", 1);

let itemIsBlue = new RelationInstance(item, is, blue);
let implication = new Implication(is, blue, is, cube, 0.9);

let combined = itemIsBlue.combine([implication]);
console.log(combined.toString());
