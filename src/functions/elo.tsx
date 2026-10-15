function CalculateExpectedScore(ratingA: number, ratingB: number) {
    return 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
}

enum Result {
    win,
    lose,
    tie,
}

function GetScoreFromResult(result: Result) {
    switch (result) {
        case Result.win:
            return 1
        case Result.lose:
            return 0
        case Result.tie:
            return 0.5
    }
}

function CalculateEloChange(currentRating: number, opponentRating: number, kFactor: number, result: Result) {
    const performedScore: number = GetScoreFromResult(result)
    const expectedScore: number = CalculateExpectedScore(currentRating, opponentRating)
    return currentRating + kFactor * (performedScore - expectedScore)
}

export default CalculateEloChange
