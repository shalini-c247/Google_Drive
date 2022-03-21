const UserModel = require("../models/UserModel");
const fs = require('fs');
const { json } = require("express/lib/response");

const stripeSecretKey = process.env.STRIPE_SECRET;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require('stripe')(stripeSecretKey);

const subscription = async (req, res) => {
    const userId = req.session.userId
    if (!userId) {
        return res.redirect('/login')
    }
    else {
        const buttonValue = [
            { id: "freePlan", color: "bg-dark", name:"Free Plan", price:"$5.0" },
            { id: "basicPlan", color: "bg-secondary",  name:"Basic Plan", price:"$10.0" },
            { id: "standard", color: "bg-dark" , name:"Standard", price:"$15.0"},
            { id: "premium", color: "bg-secondary", name:"Premium", price:"$20.0" },
        ]

        // const plans = [
        //     {
        //         name:"Free Plan",
        //         price:"$5.0"
        //     },
        //     {
        //         name:"Basic Plan",
        //         price:"$10.0"
        //     },
        //     {
        //         name:"Standard",
        //         price:"$15.0"
        //     },
        //     {
        //         name:"Premium",
        //         price:"$20.0"
        //     }
        // ]
        
        return res.render('subscription/subscription', {
            data: buttonValue,
        })

    }
}
const subscriptionAction = async (req, res) => {
            try {

                const { plan } = req.body;
                const userId = req.session.userId;
                console.log("subscription....", userId)
                await UserModel.findOneAndUpdate({ _id: userId }, { $set: { plan: plan } }, { new: true })
                return res.redirect("/paymentpage");

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message:
                        "We are having some error while completing your request. Please try again after some time.",
                    error: error
                });
            }
        }

const paymentPage = async (req, res) => {
            try {
                return res.render('subscription/paymentpage', { 
                    key: stripePublicKey
                }) 
            } catch (e) {
                return res.status(500).json({
                    success: false,
                    message:
                        "We are having some error while completing your request. Please try again after some time.",
                    error: error
                });
            }
        }

const paymentAction = async (req, res) => {
    try {
            console.log("helloo")
            stripe.customers.create({ 
                email: req.body.stripeEmail, 
                source: req.body.stripeToken, 
                name: 'Stripe Payment', 
                address: { 
                    line1: 'TC 9/4 Old MES colony', 
                    postal_code: '110092', 
                    city: 'New Delhi', 
                    state: 'Delhi', 
                    country: 'India', 
                } 
            }) 
            .then((customer) => { 
                return stripe.charges.create({ 
                    amount: 7000,    // Charing Rs 25 
                    description: 'Subscription plan', 
                    currency: 'USD', 
                    customer: customer.id 
                }); 
            }) 
            .then((charges) => { 
                console.log(charges)
                console.log("charge")
                return res.render("subscription/success")// If no error occurs 
            }) 
            .catch((err) => { 
                 return res.send(err)    // If some error occurs 
            }); 
    } catch (e) {
            return res.status(500).json({
                success: false,
                message:
                        "We are having some error while completing your request. Please try again after some time.",
                error: error
            });
    }
}


module.exports = 
{
    subscription,
    subscriptionAction,
    paymentPage,
    paymentAction,
}
