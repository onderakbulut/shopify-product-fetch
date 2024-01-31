const getBtn = document.querySelector('#generate')
const saveBtn = document.querySelector('#save')
const url = document.querySelector('#url')
const limit = document.querySelector('#limit')

getBtn.addEventListener('click', function (e) {
  // check if url is empty
  if (url.value === '') {
    alert('Please enter your store url')
    return
  }

  // check if url is valid
  const regex = new RegExp('^(http|https)://', 'i')
  if (!regex.test(url.value)) {
    alert('Please enter valid url')
    return
  }

  // remove trailing slash
  url.value = url.value.replace(/\/$/, '')

  getBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> <span role="status">Loading...</span>'

  const heading = ['Handle', 'Title', 'Body (HTML)', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Variant Image', 'Status'].join(',')
  const products = []

  getProducts().then(response => {
    response.products.forEach(product => {
      const handle = product.handle
      const title = product.title
      const body = JSON.stringify(product.body_html).replace(/\\"/g, '""').replace(/\\n/g, '')
      const tags = JSON.stringify(product.tags.join(','))
      const published = true
      const option1Name = typeof product.options[0] === 'undefined' ? '' : product.options[0].name
      const option2Name = typeof product.options[1] === 'undefined' ? '' : product.options[1].name
      const option3Name = typeof product.options[2] === 'undefined' ? '' : product.options[2].name
      const variants = product.variants

      variants.forEach((variant, index) => {
        const option1Value = variant.option1 === null ? '' : variant.option1
        const option2Value = variant.option2 === null ? '' : variant.option2
        const option3Value = variant.option3 === null ? '' : variant.option3
        const sku = variant.sku === null ? '' : variant.sku
        const compareAtPrice = variant.compare_at_price === null ? '' : variant.compare_at_price
        const imageSrc = typeof product.images[index] === 'undefined' ? '' : decodeURI(product.images[index].src)
        const imagePosition = typeof product.images[index] === 'undefined' ? '' : product.images[index].position
        const variantImage = variant.featured_image === null ? '' : decodeURI(variant.featured_image.src)

        if (index < 1) {
          const product = [handle, title, body, tags, published, option1Name, option1Value, option2Name, option2Value, option3Name, option3Value, sku, variant.price, compareAtPrice, variant.requires_shipping, variant.taxable, imageSrc, imagePosition, variantImage, 'active']
          products.push(product.join(','))
        } else {
          const product = [handle, '', '', '', '', '', option1Value, '', option2Value, '', option3Value, sku, variant.price, compareAtPrice, variant.requires_shipping, variant.taxable, imageSrc, imagePosition, variantImage, '']
          products.push(product.join(','))
        }
      })
    })

    products.unshift(heading)
    getBtn.innerHTML = 'Get'
    if (saveBtn.hasAttribute('disabled')) {
      saveBtn.attributes.removeNamedItem('disabled')
    }

    const data = products.map(function (x) {
      return x.split(',')
    })

    const container = document.querySelector('#result')
    container.innerHTML = ''

    const table = new window.Handsontable(container, {
      data,
      rowHeaders: true,
      colHeaders: true,
      height: 'auto',
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation'
    })

    table.render()

    saveBtn.addEventListener('click', function (e) {
      const blob = new Blob([products.join('\n')], {
        type: 'text/plain;charset=utf-8'
      })
      window.saveAs(blob, 'products.csv')
    })
  })
})

async function getProducts () {
  const response = await fetch(url.value + '/products.json?limit=' + limit.value).catch((error) => {
    alert(error)
  })

  if (!response.ok) {
    alert(`Please enter valid shopify store  ${response.status}`)
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}
