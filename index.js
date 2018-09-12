const fs = require('fs')
const winston = require('winston')

async function run () {
  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val)
  })
  console.log(process.argv)
  const files = await fs.readdirSync('./test-comics/0-Day Week of 2018.08.22')
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

  // let comics = []
  // let last = []
  for (const comic of files) {
    if (comic.endsWith('.cbz') || comic.endsWith('.cbr')) {
      // let comicFixed = comic.replace(stripRegex, '')
      let comicYear = comic.match(yearRegex)
      let comicName = comic.replace(issue2Regex, '').match(seriesRegex)
      // let comicNameFixed = comicName.toString().replace(issue2Regex, '').trim()
      // console.log(`${comicName.toString().trim()} ${comicYear}`)
      try {
        // fs.mkdirSync(`./test2/${comicName.toString().trim()} ${comicYear}`)
        logger.log('info', `${comic} ==> ./test2/${comicName.toString().trim()} ${comicYear}/`)
        // fs.copyFileSync(`./test-comics/0-Day Week of 2018.08.22/${comic}`, `./test2/${comicName.toString().trim()} ${comicYear}/${comic}`)
      } catch (error) {
        console.log(error)
        console.log('Dir exists')
      }
      // comics.push(_comic)
    }
  }
}

run().catch(error => console.log(error))
