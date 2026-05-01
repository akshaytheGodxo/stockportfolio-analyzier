def moving_average(prices):
    if not prices:
        return 0
    return sum(prices) / len(prices)
