const fs = require('fs')
const winston = require('winston')
async function run () {
  const files = await fs.readdirSync('./unsorted/')
  // const stripRegex = /\(.*?\)/gim
  // const issueRegex = / \d([^)a-z]+)\d /gi
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    )
  })

  const yearRegex = /\(([^)a-zA-Z]+)\)/gm
  const seriesRegex = /^[^\\(]+/gm
  const issue2Regex = /\d+\b/gim

  for (let comic of files) {
    if (comic.endsWith('.cbz') || comic.endsWith('.cbr')) {
      let comicYear = comic.match(yearRegex)
      let comicName = comic.replace(issue2Regex, '').match(seriesRegex)

      if (!fs.existsSync(`./sorted/${comicName.toString().trim()} ${comicYear}`)) {
        logger.log('info', `Creating dir: ./sorted/${comicName.toString().trim()} ${comicYear}`)
        fs.mkdirSync(`./sorted/${comicName.toString().trim()} ${comicYear}`)
      } else {
        logger.warn(`./sorted/${comicName.toString().trim()} ${comicYear} ALREADY EXISTS!`)
      }
      if (!fs.existsSync(`./sorted/${comicName.toString().trim()} ${comicYear}/${comic}`)) {
        // logger.log('info', `Copying file: ${comic} ==> ./sorted/${comicName.toString().trim()} ${comicYear}/`)
        fs.copyFileSync(`./unsorted/${comic}`, `./sorted/${comicName.toString().trim()} ${comicYear}/${comic}`, (err) => {
          if (err) throw err
          logger.log('info', `Copied file: ${comic} ==> ./sorted/${comicName.toString().trim()} ${comicYear}/`)
        })
      } else {
        logger.warn(`./unsorted/${comicName.toString().trim()} ${comicYear}/${comic} ALREADY EXISTS!`)
      }
    }
  }
}

run().catch(error => console.log(error))
