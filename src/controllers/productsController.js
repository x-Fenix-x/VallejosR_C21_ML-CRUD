const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { DateTime } = require('luxon');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const toThousand = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const controller = {
    // Root - Show all products
    index: (req, res) => {
        const productsFilePath = path.join(
            __dirname,
            '../data/productsDataBase.json'
        );
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
        return res.render('products', {
            products,
            toThousand,
        });
    },

    // Offers - Products on sale
    offers: (req, res) => {
        return res.render('offers', {
            productsInSale: products.filter(
                (product) => product.category === 'in-sale'
            ),
            toThousand,
        });
    },

    // Detail - Detail from one product
    detail: (req, res) => {
        const product = products.find(
            (product) => product.id === req.params.id
        );
        return res.render('detail', {
            ...product,
            toThousand,
        });
    },

    // Create - Form to create
    create: (req, res) => {
        return res.render('product-create-form');
    },

    // Create -  Method to store
    store: (req, res) => {
        const { name, price, discount, description, category } = req.body;
        const image = req.file ? req.file.filename : null;

        let newProduct = {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim(),
            price: +price,
            discount: +discount,
            category,
            image: image,
            createAt: DateTime.local(),
        };

        products.push(newProduct);
        fs.writeFileSync(
            productsFilePath,
            JSON.stringify(products, null, 3),
            'utf-8'
        );
        return res.redirect('/products');
    },

    // Update - Form to edit
    edit: (req, res) => {
        const product = products.find(
            (product) => product.id === req.params.id
        );
        return res.render('product-edit-form', {
            ...product,
        });
    },

    // Update - Method to update
    update: (req, res) => {
        const { name, price, discount, description, category } = req.body;
        const image = req.file ? req.file.filename : null;

        const productUpdate = products.find(
            (product) => product.id === req.params.id
        );

        if (image) {
            if (productUpdate.image) {
                const imagePath = `./public/images/products/${productUpdate.image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            productUpdate.image = image;
        }

        productUpdate.name = name.trim();
        productUpdate.description = description.trim();
        productUpdate.price = +price;
        productUpdate.discount = +discount;
        productUpdate.category = category;

        fs.writeFileSync(
            productsFilePath,
            JSON.stringify(products, null, 3),
            'utf-8'
        );
        return res.redirect('/products');
    },

    // Delete - Delete one product from DB
    destroy: (req, res) => {
        const productDestroy = products.find(
            (product) => product.id === req.params.id
        );

        if (productDestroy.image) {
            const imagePath = `./public/images/products/${productDestroy.image}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const productsModify = products.filter(
            (product) => product.id !== req.params.id
        );
        fs.writeFileSync(
            productsFilePath,
            JSON.stringify(productsModify, null, 3),
            'utf-8'
        );
        return res.redirect('/products');
    },
};

module.exports = controller;
