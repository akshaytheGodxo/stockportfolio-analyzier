"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is Pookie Wallet free to use?",
    answer:
      "Yes! We offer a free tier with essential features. You can upgrade to Pro or Premium for advanced features like real-time data and unlimited watchlists.",
  },
  {
    question: "Do I need to connect my bank account?",
    answer:
      "No, Pookie Wallet uses paper trading (virtual money) for all transactions. Your real bank account is never connected.",
  },
  {
    question: "Is the market data real-time?",
    answer:
      "Real-time data is available for Pro and Premium subscribers. Free users get delayed data updates.",
  },
  {
    question: "Can I trade real stocks through Pookie Wallet?",
    answer:
      "No, Pookie Wallet is for paper trading only. It's designed for learning and strategy testing, not actual stock trading.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription anytime from your account settings. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards and debit cards through our secure payment processor. Stripe integration coming soon.",
  },
]

export function FAQ() {
  return (
    <section className="py-24 px-6 lg:px-24 bg-background">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Pookie Wallet.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}


