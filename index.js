const fs = require('fs')
const winston = require('winston')
const path = require('path')
const ComicVine = require('../ComicVineWrapper')
const config = require('./config.json')
const fsr = require('fs-readdir-recursive')
let client = new ComicVine(config.API_TOKEN)

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  )
})

async function run () {
  let comics = await fsr('./unsorted')
  if (!fs.existsSync('./unsorted/')) {
    fs.mkdirSync('./unsorted/')
  }
  // const stripRegex = /\(.*?\)/gim
  // const issueRegex = / \d([^)a-z]+)\d /gi

  ComicSort(comics)
}

async function ComicSort (comics) {
  const yearRegex = /\(([^)a-zA-Z]+)\)/gm
  const seriesRegex = /^[^\\(]+/gm
  const issue2Regex = /\d+\b/gim
  let publisher

  for (let comic of comics) {
    let filename = path.basename(comic)
    if (filename.endsWith('.cbz') || filename.endsWith('.cbr')) {
      let comicYear = filename.match(yearRegex)
      let comicName = filename.replace(issue2Regex, '').match(seriesRegex).toString().trim()
      let comicIssue = filename.replace(yearRegex, '').match(issue2Regex)

      logger.log('info', `Querying ComicVine for "${comicName}"`)

      let query = await client.search.searchComic({
        query: `${comicName}`,
        sort: 'name:desc'
      })
      let _comic = query.results[0]
      if (typeof _comic === 'undefined') {
        publisher = 'Unknown'
      } else {
        publisher = _comic.publisher.name
      }

      if (!fs.existsSync(`./sorted/${publisher}/`)) {
        fs.mkdirSync(`./sorted/${publisher}/`)
      }
      if (!fs.existsSync(`./sorted/${publisher}/${comicName} ${comicYear}`)) {
        logger.log('info', `Creating dir: ./sorted/${publisher}/${comicName} ${comicYear}`)
        fs.mkdirSync(`./sorted/${publisher}/${comicName} ${comicYear}`)
      }
      if (!fs.existsSync(`./sorted/${publisher}/${comicName} ${comicYear}/${filename}`)) {
        fs.copyFileSync(comic, `./sorted/${publisher}/${comicName} ${comicYear}/${filename}`, (err) => {
          if (err) throw err
          logger.log('info', `Copied file: ${comic} ==> ./sorted/${publisher}/${comicName} ${comicYear}/`)
        })
      } else {
        logger.warn(`./sorted/${publisher}/${comicName} ${comicYear}/${filename} ALREADY EXISTS!`)
      }
    }
  }
}

run().catch(error => console.log(error))
