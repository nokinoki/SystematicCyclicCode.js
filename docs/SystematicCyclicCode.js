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

//���������Z�̃��[�J�����\�b�h(x/y)
//x,y�͂��ꂼ�ꃂ�j�b�N������, �Ԃ�l��[��,��]]�̔z��
//Memo:�Ђ��Z���V�~�����[�g
SystematicCyclicCode.prototype.polyDiv = function (x, xRank, y, yRank) {
    //���̊i�[�ϐ�
    var quotient = 0;
    //������폙���ɍ��Ō����킹
    y = y << xRank - yRank;
    //���̏����Ɣ폙�����E�ő����܂Ń��[�v
    for (var i = 0; i <= xRank - yRank; i++) {
        //���݂̔폙���̍ŏ�ʌ���1�Ȃ犄��
        if ((x >> xRank - i) & 1 == 1) {
            x ^= y;
            quotient += 1;
        }
        //��������E�ɃV�t�g
        y = y >> 1;
        //���͈���ɃV�t�g
        quotient = quotient << 1;
    }
    //for�Ō�̗]���ȃV�t�g�𒲐�
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
    //�V���h���[���̌v�Z
    var syndrome = this.polyDiv(reciveCode, codeLen - 1, genePoly, genePolyDigree)[0];
    //�G���[�ӏ��̑I��
    var error = this.syndrome[syndrome];

    //�G���[����
    var sentCode = reciveCode ^ error;
    return sentCode >> genePolyDigree;
}

SystematicCyclicCode.prototype.decodeToString = function (reciveCode) {

    return (this.zero + this.decode(reciveCode).toString(2)).substr(-this.infoLen);
}