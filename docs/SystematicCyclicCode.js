SystematicCyclicCode = function (infoLen, codeLen, genePoly, genePolyDigree) {
    //Properties
    this.infoLen = infoLen;
    this.codeLen = codeLen;
    this.genePolyDigree = genePolyDigree;
    this.recoveryLen = Math.floor(genePolyDigree / 2);

    this.genePoly = genePoly;
    this.surplusPoly = 0b0;

    this.syndrome = [];

    this.zero = "";

    //Constructor
    for (var i = 0; i < codeLen; i++) {
        var errorPoly = 1 << i;
        this.syndrome[this.generate(errorPoly)] = 1 << i;
    }

    for (var i = 0; i < this.codeLen; i++) {
        this.zero += 0;
    }

}

//多項式除算のローカルメソッド(x/y)
//x,yはそれぞれモニック多項式, 返り値は[商,剰余]の配列
//Memo:ひっ算をシミュレート
SystematicCyclicCode.prototype.polyDiv = function (x, xRank, y, yRank) {
    //商の格納変数
    var quotient = 0;
    //徐式を被徐式に左で桁合わせ
    y = y << xRank - yRank;
    //元の徐式と被徐式が右で揃うまでループ
    for (var i = 0; i <= xRank - yRank; i++) {
        //現在の被徐式の最上位桁が1なら割る
        if ((x >> xRank - i) & 1 == 1) {
            x ^= y;
            quotient += 1;
        }
        //徐式を一つ右にシフト
        y = y >> 1;
        //商は一つ左にシフト
        quotient = quotient << 1;
    }
    //for最後の余分なシフトを調整
    quotient = quotient >> 1;
    return [quotient, x];
}

SystematicCyclicCode.prototype.generate = function (infoCode) {
    var shiftedCode = infoCode << (this.codeLen - this.infoLen);
    //console.log("infoCode: " + infoCode.toString(2).slice(-this.infoLen));
    //console.log("shiftCode: " + shiftedCode.toString(2).slice(-this.codeLen));
    this.surplusPoly = this.polyDiv(shiftedCode, this.codeLen - 1, this.genePoly, this.genePolyDigree)[1];
    return shiftedCode + this.surplusPoly;
};

SystematicCyclicCode.prototype.generateToString = function (infoCode) {
    
    return (this.zero + this.generate(infoCode).toString(2)).substr(-this.codeLen);
};

SystematicCyclicCode.prototype.encode = this.generate;

SystematicCyclicCode.prototype.encodeToString = this.generateToString;

SystematicCyclicCode.prototype.decode = function (reciveCode) {
    //シンドロームの計算
    var syndrome = this.polyDiv(reciveCode, codeLen - 1, genePoly, genePolyDigree)[0];
    //エラー箇所の選定
    var error = this.syndrome[syndrome];

    //エラー訂正
    var sentCode = reciveCode ^ error;
    return sentCode >> genePolyDigree;
}

SystematicCyclicCode.prototype.decodeToString = function (reciveCode) {

    return (this.zero + this.decode(reciveCode).toString(2)).substr(-this.infoLen);
}