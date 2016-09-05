#!/usr/bin/python3

import json


def parse_card(index):
    buf = []
    for i in range(4):
        divisor = 3
        buf.append(index % divisor)
        index = index // divisor
    return tuple(reversed(buf))


deck = []
for i in range(81):
    deck.append(parse_card(i))

sets = []
for i in range(81):
    for j in range(i, 81):
        for k in range(j, 81):
            if set(map(len, map(set, zip(deck[i], deck[j], deck[k])))) == set({1, 3}):
                sets.append((i, j, k))
print(sets)

with open('sets.json', 'w') as f:
    json.dump(sets, f)
