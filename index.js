const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");
const { query } = require("express");

require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xloj4nu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const myTasksCollections = client
            .db("tasks-tracker")
            .collection("myTasks");

        const completedTasksCollections = client
            .db("tasks-tracker")
            .collection("completedTasks");

        // post my tasks
        app.post("/myTasks", async (req, res) => {
            // receive from client
            const myTasks = req.body;
            console.log(myTasks);
            const query = {};

            // store in db
            const result = await myTasksCollections.insertOne(myTasks);
            res.send(result);
        });

        // get my tasks
        app.get("/myTasks/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };

            const tasks = await myTasksCollections.find(query).toArray();
            res.send(tasks);
        });

        // get specified task
        app.get("/edit/:id", async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };

            const task = await myTasksCollections.findOne(filter);
            res.send(task);
        });

        // mark as completed
        app.put("/addCompleted/:id", async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    completed: true,
                },
            };
            const result = await myTasksCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // mark as uncompleted
        app.put("/markInComplete/:id", async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    completed: false,
                },
            };
            const result = await myTasksCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // update task
        app.put("/edit/:id", async (req, res) => {
            const id = req.params.id;
            const task = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: task.title,
                    description: task.description,
                    date: task.date,
                },
            };
            const result = await myTasksCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
    } finally {
    }
}

run().catch((e) => console.log(e));
app.get("/", (req, res) => {
    res.send("task tracker server is running...");
});

app.listen(port, () => {
    console.log(`task tracker is running on ${port}`);
});
