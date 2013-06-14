import math

if __name__ == "__main__":
    for r in [0.01, 0.025, 0.05, 0.075, 0.1]:
        print "%0.1f%%\t%0.1f%%" % ((100 * r), (1.0 / math.log(1+r)))
