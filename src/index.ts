import express from "express";
import figlet from "figlet";

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async() => {
    const text = await figlet.text("Namaste Bun!"); 
    console.log(text)
    console.log(`Listening on port ${port}...`);
});
console.log("Hello via Bun!");