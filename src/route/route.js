const express = require('express')
const axios = require('axios')
const Model = require("../model/model")

const router = express.Router()


let urlRegex = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;


router.post("/url/shorten", async (req, res) => {
    try {

        let realUrl = req.body.url.trim()

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Body can't be empty" })
        if (!realUrl) return res.status(400).send({ status: false, message: "Enter a link to shorten" })


        if (!urlRegex.test(realUrl)) return res.status(400).send({ status: false, message: "Please enter a valid url" })

        let validUrl = await axios.get(realUrl)
        .then(() => longUrl)
        .catch(() => null)
        if (!validUrl) return res.status(400).send({ status: false, message: "Please enter a working url" })


        let sameUrl = await Model.findOne({ longUrl: realUrl }).select({ _id: 0, __v: 0 })
        if (sameUrl) return res.status(200).send({ status: true, message: "Data already present in our database", data: sameUrl })



        let ranNum = Math.floor(Math.random() * (15 - 10 + 1)) + 10
        let char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = ""

        for (let i = 0; i < ranNum; i++) {
            code += char.charAt(Math.floor(Math.random() * char.length));
        }


        let newUrl = `localhost:3000/${code}`

        let urlData = {
            urlCode: code,
            longUrl: realUrl,
            shortUrl: newUrl
        }

        let savedData = await Model.create(urlData)

        return res.status(201).send({ status: true, data: savedData })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
})


router.get("/:urlCode", async (req, res) => {
    try {
        let code = req.params.urlCode

        let urlData = await Model.findOne({ urlCode: code }).select({ longUrl: 1, _id: 0 })

        if (!urlData) return res.status(404).send({ status: false, message: "This short url not exist in the database" })

        let longUrl = urlData.longUrl

        // return res.status(302).send({ longUrl })
        return res.redirect(longUrl)
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
})

module.exports = router