const { BadRequestError } = require("../helpers/errors");
const handle = require("../helpers/promise");
const db = require("../models");
const Contact = db.Contact;

// Create and Save a new Contact
exports.create = async (req, res, next) => {
    // Validate request
    if (!req.body.name) {
        return next(new BadRequestError(400, "Name can not be empty"));
    }

    // Create a contact
    const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        favorite: String(req.body.favorite).toLowerCase() === "true",
        ownerId: req.userId,
    });

    // Save contact in the database
    const [error, document] = await handle(contact.save());

    if (error) {
        return next(
            new BadRequestError(
                500,
                "An error occurred while creating the contact"
            )
        );
    }

    return res.send(document);
};

// Retrieve all contacts of a user from the database
exports.findAll = async (req, res, next) => {
    const condition = { ownerId: req.userId };
    const name = req.query.name;
    if (name) {
        condition.name = { $regex: new RegExp(name), $options: "i" };
    }

    const [error, documents] = await handle(
        Contact.find(condition, "-ownerId")
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                "An error occurred while retrieving contacts"
            )
        );
    }

    return res.send(documents);
};

// Find a single contact with an id
exports.findOne = async (req, res, next) => {
    const condition = {
        _id: req.params.id,
        ownerId: req.userId,
    };

    const [error, document] = await handle(
        Contact.findOne(condition, "-ownerId")
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                `Error retrieving contact with id=${req.params.id}`
            )
        );
    }

    if (!document) {
        return next(new BadRequestError(404, "Contact not found"));
    }

    return res.send(document);
};

// Update a contact by the id in the request
exports.update = async (req, res, next) => {
    if (!req.body) {
        return next(
            new BadRequestError(400, "Data to update can not be empty")
        );
    }

    const condition = {
        _id: req.params.id,
        ownerId: req.userId,
    };

    const [error, document] = await handle(
        Contact.findOneAndUpdate(condition, req.body, {
            new: true,
            projection: "-ownerId",
        })
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                `Error updating contact with id=${req.params.id}`
            )
        );
    }

    if (!document) {
        return next(new BadRequestError(404, "Contact not found"));
    }

    return res.send({ message: "Contact was updated successfully" });
};

// Delete a contact with the specified id in the request
exports.delete = async (req, res, next) => {
    const condition = {
        _id: req.params.id,
        ownerId: req.userId,
    };

    const [error, document] = await handle(
        Contact.findOneAndDelete(condition, {
            projection: "-ownerId",
        })
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                `Could not delete contact with id=${req.params.id}`
            )
        );
    }

    if (!document) {
        return next(new BadRequestError(404, "Contact not found"));
    }

    return res.send({ message: "Contact was deleted successfully" });
};

// Delete all contacts of a user from the database
exports.deleteAll = async (req, res, next) => {
    const [error, data] = await handle(
        Contact.deleteMany({ ownerId: req.userId })
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                "An error occurred while removing all contacts"
            )
        );
    }

    return res.send({
        message: `${data.deletedCount} contacts were deleted successfully`,
    });
};

// Find all favorite contacts of a user
exports.findAllFavorite = async (req, res, next) => {
    const [error, documents] = await handle(
        Contact.find(
            {
                favorite: true,
                ownerId: req.userId,
            },
            "-ownerId"
        )
    );

    if (error) {
        return next(
            new BadRequestError(
                500,
                "An error occurred while retrieving favorite contacts"
            )
        );
    }

    return res.send(documents);
};
